import './modal.css';

export type OnCloseModal = () => void;
export type HandleChange = (event: any, id: number) => void;

type ModalProps = {
    title?: string;
    children: React.ReactNode;
    hidden: boolean;
    onClose: OnCloseModal;
};

export function ModalComponent(props: ModalProps) {
    return (
        <div className={props.hidden ? 'modal modal_hidden' : 'modal'} onClick={props.onClose}>
            <div className='modal_container'>
                <div className='modal_header'>
                    <div className='Modal_title'>{props.title || 'Modal'}</div>
                    <button onClick={props.onClose} type='button' className='close'>
                        <span>&times;</span>
                    </button>
                </div>
                <div className='modal_body'>{props.children}</div>
            </div>
        </div>
    );
}
