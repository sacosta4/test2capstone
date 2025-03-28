import os
import traceback
import gc
import time
import signal
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyqubo import Binary, Spin

import json

app = Flask(__name__)
CORS(app)

# Signal handler for timeouts
class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Function execution timed out")

def with_timeout(func, args=(), kwargs={}, timeout_duration=5):
    """Run a function with a timeout"""
    # Set the signal handler
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout_duration)
    
    try:
        result = func(*args, **kwargs)
        signal.alarm(0)  # Cancel the alarm
        return result
    except TimeoutError:
        # Reset the signal handler
        signal.alarm(0)
        print("Function execution timed out")
        raise
    finally:
        # Reset the signal handler
        signal.alarm(0)

def monitor_memory():
    """Track memory usage if psutil is available"""
    try:
        # Only import psutil conditionally to avoid import errors
        try:
            import psutil
            process = psutil.Process(os.getpid())
            memory_info = process.memory_info()
            print(f"Memory Usage: {memory_info.rss / (1024 * 1024):.2f} MB")
        except ImportError:
            # psutil not available, provide minimal info
            print("psutil not available, memory usage monitoring disabled")
            pass
    except Exception as e:
        print(f"Error monitoring memory: {e}")

def perform_cleanup():
    """Perform garbage collection and memory cleanup"""
    try:
        # Run garbage collection
        collected = gc.collect()
        print(f"Garbage collection: collected {collected} objects")
        
        # Check for unreachable objects
        if gc.garbage:
            print(f"Warning: {len(gc.garbage)} unreachable objects found")
            # Clear the garbage list
            gc.garbage.clear()
        
        # Monitor memory
        monitor_memory()
    except Exception as e:
        print(f"Error during cleanup: {e}")

# Set up periodic cleanup
cleanup_interval = 300  # seconds
last_cleanup_time = time.time()

def check_cleanup():
    """Check if it's time to run cleanup"""
    global last_cleanup_time
    current_time = time.time()
    
    if current_time - last_cleanup_time > cleanup_interval:
        print("Running periodic cleanup...")
        perform_cleanup()
        last_cleanup_time = current_time

def parse_variables(variable_data):
    """Parse variables from JSON and create PyQUBO variables."""
    variables = {}

    # Add robust logging
    print("Parsing variables:", variable_data)

    try:
        for var_name, var_info in variable_data.items():
            try:
                if var_info["type"] == "Binary":
                    variables[var_name] = Binary(var_name)
                elif var_info["type"] == "Spin":
                    variables[var_name] = Spin(var_name)
                elif var_info["type"] == "Array":
                    size = var_info.get("size", 10)
                    variables[var_name] = [Binary(f"{var_name}[{i}]") for i in range(size)]
                else:
                    print(f"Unsupported variable type: {var_info['type']}")
                    return None
            except Exception as e:
                print(f"Error parsing variable {var_name}: {e}")
                return None
    except Exception as e:
        print(f"Global error parsing variables: {e}")
        return None
    
    return variables

def parse_constraints(constraint_data, variables):
    """Parse constraints from JSON and convert them to PyQUBO format."""
    constraints = []
    
    # Add robust logging
    print("Parsing constraints:", constraint_data)

    if not constraint_data:
        return constraints

    try:
        for constraint in constraint_data:
            try:
                lhs_expr = constraint.get("lhs", "0")
                comparison = constraint.get("comparison", "=")
                rhs = constraint.get("rhs", 0)
                
                # Use safer evaluation
                lhs = eval(lhs_expr, {"__builtins__": None}, variables)

                if comparison == "=":
                    constraints.append((lhs - rhs) ** 2)  # Enforce equality
                elif comparison == "<=":
                    constraints.append((lhs - rhs) * (lhs - rhs))  # Penalize if lhs > rhs
                elif comparison == ">=":
                    constraints.append((rhs - lhs) * (rhs - lhs))  # Penalize if lhs < rhs
                elif comparison == "!=":
                    constraints.append((lhs - rhs) ** 2 * 100)  # Large penalty to enforce inequality
            except Exception as e:
                print(f"Error parsing constraint: {constraint}, Error: {e}")
                return None
    except Exception as e:
        print(f"Global error parsing constraints: {e}")
        return None

    return constraints

def parse_objective(objective_expr, variables):
    """Parse objective function from JSON."""
    print("Parsing objective:", objective_expr)
    
    try:
        # Use safer evaluation
        if objective_expr == "0" or objective_expr == "":
            print("Warning: Objective is just 0, creating a dummy objective")
            # Create a dummy objective with all variables to avoid compilation error
            obj = 0
            for var_name, var in variables.items():
                obj += 0 * var  # Add 0 * var to avoid affecting the result
            return obj
            
        return eval(objective_expr, {"__builtins__": None}, variables)
    except Exception as e:
        print(f"Error parsing objective: {objective_expr}, Error: {e}")
        return None

def create_fallback_qubo(board_size=9):
    """Create a fallback QUBO with positive values if normal processing fails."""
    print("Creating fallback QUBO with positive values")
    qubo = {}
    offset = 1
    
    # Create simple QUBO with diagonal elements
    # Use positive values (higher = better)
    for i in range(board_size):
        var_name = f"('x{i}', 'x{i}')"
        # Center is best, then corners, then edges
        if i == 4:  # Center
            qubo[var_name] = 9  # Highest weight
        elif i in [0, 2, 6, 8]:  # Corners
            qubo[var_name] = 7  # Second highest
        else:  # Edges
            qubo[var_name] = 5  # Lowest weight
        
        # Add quadratic terms as penalties
        for j in range(i+1, board_size):
            qubo_key = f"('x{i}', 'x{j}')"
            qubo[qubo_key] = -4  # Negative penalty for selecting multiple positions
    
    return qubo, offset

def process_qubo_data(data):
    """Process QUBO data with timeout protection"""
    try:
        # Parse quantum variables
        variables = parse_variables(data.get("variables", {}))
        if variables is None:
            print("Error: Failed to parse variables")
            return None
        
        # Parse constraints
        constraints = parse_constraints(data.get("Constraints", []), variables)
        if constraints is None:
            print("Error: Failed to parse constraints")
            return None
        
        # Parse objective function
        objective = parse_objective(data.get("Objective", "0"), variables)
        if objective is None:
            print("Error: Failed to parse objective function")
            return None
        
        # Add a dummy variable if objective is just a constant
        if isinstance(objective, (int, float)):
            print("Warning: Objective is a constant, adding dummy variables")
            dummy_terms = 0
            for var_name, var in variables.items():
                dummy_terms += 0 * var  # Won't affect the result
            objective = objective + dummy_terms
        
        # Build final QUBO model
        qubo_model = sum(constraints) + objective
        compiled_qubo = qubo_model.compile()
        qubo, offset = compiled_qubo.to_qubo()
        
        # Convert tuple keys to strings
        qubo_str_keys = {str(k): v for k, v in qubo.items()}
        
        # Check that QUBO has values
        if not qubo_str_keys or len(qubo_str_keys) == 0:
            print("Warning: Empty QUBO generated")
            return None
            
        return {
            'qubo': qubo_str_keys, 
            'offset': offset,
            'explanation': {
                "highlights": ["QUBO generated successfully"],
                "method": "quantum_annealing",
                "problem_type": "binary_quadratic_optimization",
                "variable_count": len(variables),
                "constraint_count": len(constraints) if constraints else 0,
                "using_fallback": False
            }
        }
    except Exception as e:
        print(f"Error in process_qubo_data: {e}")
        traceback.print_exc()
        return None

@app.route('/quantum', methods=['POST'])
def calculate():
    # Check if cleanup is needed
    check_cleanup()
    
    start_time = time.time()
    print("\n--- New QUBO Request ---")
    
    try:
        data = request.json
        print("Received QUBO data:", json.dumps(data, indent=2))
        
        # Track if we're using fallback and why
        using_fallback = False
        fallback_reason = ""
        
        if not data:
            print("Error: No JSON data received, using fallback")
            using_fallback = True
            fallback_reason = "No valid QUBO data received"
            fallback_qubo, fallback_offset = create_fallback_qubo()
            
            explanation = {
                "highlights": [
                    f"Using fallback QUBO: {fallback_reason}",
                    "The fallback strategy assigns higher values to better positions",
                    "Center (9) > Corners (7) > Edges (5)"
                ],
                "method": "classical_fallback",
                "problem_type": "tic_tac_toe_strategy",
                "user_qubo_error": fallback_reason,
                "using_fallback": True
            }
            
            return jsonify({
                'qubo': fallback_qubo, 
                'offset': fallback_offset,
                'explanation': explanation
            }), 200
        
        # Check for required fields and provide helpful error messages
        if "variables" not in data or not data["variables"]:
            print("Error: Missing or empty 'variables' field, using fallback")
            using_fallback = True
            fallback_reason = "Missing or empty 'variables' field"
            fallback_qubo, fallback_offset = create_fallback_qubo()
            
            explanation = {
                "highlights": [
                    f"Using fallback QUBO: {fallback_reason}",
                    "Your QUBO model needs variables defined with type: 'Binary'",
                    "Example: { 'x0': { 'type': 'Binary' }, 'x1': { 'type': 'Binary' } }"
                ],
                "method": "classical_fallback",
                "problem_type": "tic_tac_toe_strategy",
                "user_qubo_error": fallback_reason,
                "user_qubo_data": data,
                "using_fallback": True
            }
            
            return jsonify({
                'qubo': fallback_qubo, 
                'offset': fallback_offset,
                'explanation': explanation
            }), 200
        
        # Validate variable format
        for var_name, var_def in data["variables"].items():
            if not isinstance(var_def, dict) or "type" not in var_def:
                print(f"Error: Invalid variable definition for {var_name}: {var_def}")
                using_fallback = True
                fallback_reason = f"Invalid variable definition for {var_name}"
                break
            
            if var_def["type"] not in ["Binary", "Spin"]:
                print(f"Error: Unsupported variable type: {var_def['type']}")
                using_fallback = True
                fallback_reason = f"Unsupported variable type: {var_def['type']}"
                break
        
        if using_fallback:
            fallback_qubo, fallback_offset = create_fallback_qubo()
            explanation = {
                "highlights": [
                    f"Using fallback QUBO: {fallback_reason}",
                    "Variables must have type 'Binary' for Tic-Tac-Toe",
                    "Check your variable definitions"
                ],
                "method": "classical_fallback",
                "problem_type": "tic_tac_toe_strategy",
                "user_qubo_error": fallback_reason,
                "user_qubo_data": data,
                "using_fallback": True
            }
            
            return jsonify({
                'qubo': fallback_qubo, 
                'offset': fallback_offset,
                'explanation': explanation
            }), 200
        
        # Process QUBO data with timeout
        try:
            result = with_timeout(
                func=lambda: process_qubo_data(data),
                timeout_duration=5  # 5 second timeout
            )
            
            if result:
                print(f"QUBO processing completed in {time.time() - start_time:.2f} seconds")
                return jsonify(result), 200
            else:
                print("Error: QUBO processing returned None")
                using_fallback = True
                fallback_reason = "QUBO processing failed"
        except TimeoutError:
            print("Error: QUBO processing timed out")
            using_fallback = True
            fallback_reason = "QUBO processing timed out after 5 seconds"
        except Exception as e:
            print(f"Error processing QUBO: {str(e)}")
            traceback.print_exc()
            using_fallback = True
            fallback_reason = f"Error processing QUBO: {str(e)}"
        
        # Use fallback if processing failed
        fallback_qubo, fallback_offset = create_fallback_qubo()
        explanation = {
            "highlights": [
                f"Using fallback QUBO: {fallback_reason}",
                "The fallback strategy uses classical Tic-Tac-Toe strategy",
                "Center (9) > Corners (7) > Edges (5)"
            ],
            "method": "classical_fallback",
            "problem_type": "tic_tac_toe_strategy",
            "user_qubo_error": fallback_reason,
            "using_fallback": True
        }
        
        return jsonify({
            'qubo': fallback_qubo, 
            'offset': fallback_offset,
            'explanation': explanation
        }), 200
            
    except Exception as e:
        print(f"Unexpected error: {e}")
        traceback.print_exc()
        
        # Generate a fallback QUBO instead of returning an error
        fallback_qubo, fallback_offset = create_fallback_qubo()
        print("Using fallback QUBO due to unexpected error")
        
        explanation = {
            "highlights": [
                f"Using fallback QUBO due to unexpected error: {str(e)}",
                "The fallback strategy follows classical Tic-Tac-Toe strategy",
                "Center > Corners > Edges"
            ],
            "method": "classical_fallback",
            "problem_type": "tic_tac_toe_strategy",
            "user_qubo_error": str(e),
            "using_fallback": True
        }
        
        return jsonify({
            'qubo': fallback_qubo, 
            'offset': fallback_offset,
            'explanation': explanation
        }), 200
    finally:
        # Track request completion time
        print(f"Request completed in {time.time() - start_time:.2f} seconds")

@app.route('/api/workspaces', methods=['GET', 'POST'])
def manage_workspaces():
    if request.method == 'GET':
        # List all workspaces
        try:
            workspaces = ["example1", "example2"]  # Replace with actual logic
            return jsonify({"workspaces": workspaces}), 200
        except Exception as e:
            print(f"Error listing workspaces: {e}")
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        # Create a new workspace
        try:
            data = request.json
            name = data.get('name')
            state = data.get('state')
            
            if not name or not state:
                return jsonify({"error": "Missing required fields"}), 400
            
            # Save workspace logic here
            return jsonify({"message": f"Workspace '{name}' saved successfully"}), 201
        except Exception as e:
            print(f"Error saving workspace: {e}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/workspaces/<workspace_name>', methods=['GET', 'DELETE'])
def workspace_operations(workspace_name):
    if request.method == 'GET':
        # Get specific workspace
        try:
            # Mock data - replace with actual storage logic
            state = {"blocks": {}}
            return jsonify({"name": workspace_name, "state": state}), 200
        except Exception as e:
            print(f"Error retrieving workspace: {e}")
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'DELETE':
        # Delete workspace
        try:
            # Delete logic here
            return jsonify({"message": f"Workspace '{workspace_name}' deleted successfully"}), 200
        except Exception as e:
            print(f"Error deleting workspace: {e}")
            return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Add a health check endpoint to monitor server status"""
    # Perform memory check
    monitor_memory()
    
    # Return server stats
    uptime = time.time() - app.config.get('START_TIME', time.time())
    return jsonify({
        'status': 'ok',
        'uptime': f"{uptime:.2f} seconds",
        'version': '1.0.0'
    }), 200

if __name__ == '__main__':
    # Record start time for uptime tracking
    app.config['START_TIME'] = time.time()
    
    # Initial cleanup
    perform_cleanup()
    
    # Set up a cleanup interval timer
    print(f"Starting server with cleanup interval of {cleanup_interval} seconds")
    
    # Run the app
    app.run(debug=True, port=8000)