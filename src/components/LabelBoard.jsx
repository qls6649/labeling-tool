import React, {useState, useEffect} from 'react';
import * as label from '../Label/label';

export var _props;
export var _setScale;

export default function LabelBoard(props) {
    const [scale, setScale] = useState(1);


    useEffect(() => {
        console.log('LabelBoard useEffect: []');

        _props = props;
        _setScale = setScale;

        label.initialize();

        return () => label.finalize();
    }, []);


    useEffect(() => {
        console.log('LabelBoard useEffect: [props.mode]: ', props.mode);

        if(label.getMode() === props.mode) {
            console.log('useEffect: [props.mode]: returned ');
            return;
        }

        label.setMode(props.mode);

    }, [props.mode]);


    useEffect(() => {
        console.log('LabelBoard useEffect: [props.image]: ', props.image);

        if(label.compareImage(props.image)) {
            console.log('LabelBoard useEffect: [props.image]: returned');
            return;
        }

        label.redrawImage(props.currentImgURL, props.image);

    }, [props.image]);


    useEffect(() => {
        console.log('LabelBoard useEffect: [props.labels]: ');
        
        if(label.compareLabels(props.labels)) {
            console.log('LabelBoard useEffect: [props.labels]: returned');
            return;
        }

        label.redrawLabels(props.labels, props.selectedLabelsIds);

    }, [props.labels]);


    useEffect(() => {
        console.log('LabelBoard useEffect: [props.selectedLabelsIds]: ');

        if(label.compareIds(props.selectedLabelsIds)) {
            console.log('LabelBoard useEffect: [props.selectedLabelsIds]: returned');
            return;
        }

        label.setSelectedLabelIds(props.selectedLabelsIds);

    }, [props.selectedLabelsIds]);


    const changeScale = e => {
        setScale(parseFloat(e.target.value));
    }


    const changeSliderCSS = e => {
        let val = e.target.value;
        if(val <= 0.1) {
            val = 0;
        }
        e.target.style.background = 'linear-gradient(to right, #333333 0%, #333333 ' + val*50 + '%, #dedede ' + val*50 + '%, #dedede 100%)';
    }


    return (
        <div className="label-board">
            <svg id="svg" width="100%" height="100%" data-testid="testSvg">
            <defs>
                <filter id="f1">
                    <feDropShadow dx="-1" dy="1" stdDeviation="2.5" floodColor="gray"/>
                </filter>
            </defs>
                {/* <image transform="translate(50 50) scale(0.7)" id="img" href="https://via.placeholder.com/600/92c952" alt="cardImage"/> */}
                {/* <rect transform="translate(50 50)" width="100" height="100" fillOpacity="0.1" /> */}
            </svg>
            <div className="label-board-scaler">
                <img className="scaler-plus btn-img" src={require('../asset/images/plus.png')} alt="+"/>
                <input className="scaler-range" type="range" data-testid="testScaler" orient="vertical" value={scale} onInput={changeSliderCSS} onChange={changeScale} min="0.1" max="2" step="0.1" />
                <img className="scaler-minus btn-img" src={require('../asset/images/minus.png')} alt="-"/>
            </div>
            <div className="label-contextmenu">
                <div id="edit" className="item edit"><span className="item-name">Edit Class</span><span className="item-shortcut">(TBD)</span></div>
                <div id="cut" className="item cut"><span className="item-name">Cut</span><span className="item-shortcut">Ctrl + X</span></div>
                <div id="copy" className="item copy"><span className="item-name">Copy</span><span className="item-shortcut">Ctrl + C</span></div>
                <div id="paste" className="item paste"><span className="item-name">Paste</span><span className="item-shortcut">Ctrl + V</span></div>
                <div id="delete" className="item delete"><span className="item-name">Delete</span><span className="item-shortcut">Del</span></div>
            </div>
        </div>
    );
}
