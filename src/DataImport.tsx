import { useState, useRef } from 'react';
import readOfx, { ParsedType } from './utils/ofxReader';
import automaticEvaluation, { EvaluationType, EvaluatorType } from './utils/automaticEvaluation';

function DataImport() {
    const ofxInputRef = useRef<HTMLInputElement>(null);
    const evaluatorInputRef = useRef<HTMLInputElement>(null);
    const [ parsedOfx, setParsedOfx ] = useState<ParsedType>();
    const [ parsedOfxUrl, setParsedOfxUrl ] = useState<string>();
    const [ evaluatedOfx, setEvaluatedOfx ] = useState<EvaluationType>();
    const [ evaluatedOfxUrl, setEvaluatedOfxUrl ] = useState<string>();

    const handleOfxFileChange = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            if ('string' === typeof e?.target?.result) {
                const parsed = readOfx(e.target.result);
                setParsedOfx(parsed);

                const parsedBlob = new Blob([JSON.stringify(parsed, null, 2)], { type: "text/plain" });
                const parsedUrl = URL.createObjectURL(parsedBlob);
                setParsedOfxUrl(parsedUrl);
            }
        };
        reader.readAsText(file);
    };

    const handleEvaluatorFileChange = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            if ('string' === typeof e?.target?.result && parsedOfx) {
                const evaluator = JSON.parse(e.target.result);
                const evaluated = automaticEvaluation(parsedOfx, evaluator);
                setEvaluatedOfx(evaluated);
                const evaluatedBlob = new Blob([JSON.stringify(evaluated, null, 2)], { type: "text/plain" });
                const evaluatedUrl = URL.createObjectURL(evaluatedBlob);
                setEvaluatedOfxUrl(evaluatedUrl);
            }
        };
        reader.readAsText(file);
    }

    return <div>
        <div style={{ width: 500, margin: 10, border: '1px solid', padding: 10 }}>
            <label htmlFor='ofx-input'>OFX File</label>
            {
                !parsedOfx &&
                <input id='ofx-input' type='file' onChange={handleOfxFileChange} style={{ width: '100%' }} ref={ofxInputRef}/>
            }
            {
                parsedOfx &&
                <>
                    <span style={{ display: 'block' }}>Ofx: {ofxInputRef.current?.value.replace('C:\\fakepath\\', '')}</span>
                    <button style={{ width: '100%' }} onClick={() => {
                        if (ofxInputRef.current) {
                            ofxInputRef.current.value = '';
                        }
                        setParsedOfx(undefined);
                        setParsedOfxUrl(undefined);
                        setEvaluatedOfx(undefined);
                        setEvaluatedOfxUrl(undefined);
                    }}>Clear Ofx file</button>
                    <span>
                        Incomes read: {parsedOfx.incomes.length}<br/>
                        Expenses read: {parsedOfx.expenses.length}
                    </span>
                    <a style={{
                        marginTop: 10,
                        width: '100%',
                        display: "block",
                        padding: "6px 12px",
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #777",
                        borderRadius: "4px",
                        textDecoration: "none",
                        color: "#000",
                        textAlign: "center",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "14px",
                    }} href={parsedOfxUrl} download='parsed-ofx.json'>
                        Download parsed content
                    </a>
                    {
                        !evaluatedOfx &&
                        <>
                            <label htmlFor='ofx-evaluator-input'>Evaluator File</label>
                            <input id='ofx-evaluator-input' type='file' onChange={handleEvaluatorFileChange} style={{ width: '100%' }} ref={evaluatorInputRef}/>
                        </>
                    }
                </>
            }
            {
                evaluatedOfx &&
                <>
                    <span style={{ display: 'block' }}>Evaluator: {evaluatorInputRef.current?.value.replace('C:\\fakepath\\', '')}</span>
                    <button style={{ width: '100%' }} onClick={() => {
                        if (evaluatorInputRef.current) {
                            evaluatorInputRef.current.value = '';
                        }
                        setEvaluatedOfx(undefined);
                        setEvaluatedOfxUrl(undefined);
                    }}>Clear Evaluator file</button>
                    <span>
                        Unknown incomes: {evaluatedOfx?.unknownIncomes}<br/>
                        Unknown expenses: {evaluatedOfx?.unknownExpenses}
                    </span>
                    <a style={{
                        marginTop: 10,
                        width: '100%',
                        display: "block",
                        padding: "6px 12px",
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #777",
                        borderRadius: "4px",
                        textDecoration: "none",
                        color: "#000",
                        textAlign: "center",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "14px",
                    }} href={evaluatedOfxUrl} download='evaluated-ofx.json'>
                        Download interpreted content
                    </a>
                </>
            }
        </div>
    </div>;
}

export default DataImport;