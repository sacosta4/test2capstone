import './DisplayComponent.css';

function DisplayComponent({heading, text, bColor}) {

    const style = {
        backgroundColor: bColor,
    };

    return (
        <>
            <div className="display-area">
                <h2>{heading}</h2>
                <div className="display-div" style={style}>
                    <pre>{text}</pre>
                </div>
            </div>
        </>
    );
}

export default DisplayComponent;