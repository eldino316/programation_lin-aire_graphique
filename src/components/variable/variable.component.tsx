import './variable.css';

type VarProps = {
    label?: string;
    placeholder?: string;
    varString: string;
    onChange: (e: any) => void;
};

export const VariableComponent = (props: VarProps) => {
    return (
        <div className='v_item'>
            <label>{props.label ? props.label : 'Variable'}</label>
            <input className='pl_input' type='text' value={props.varString} placeholder={props.placeholder ? props.placeholder : 'Variable'} onChange={props.onChange} />
        </div>
    );
};
