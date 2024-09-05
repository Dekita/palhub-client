/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import * as CommonIcons from '@config/common-icons';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_ICONS = {
    enabled: CommonIcons.tog_enabled,
    disabled: CommonIcons.tog_disabled,
};

export default function DekCheckbox({
    text = 'option-text',
    checked = false,
    onClick = () => {},
    icons = DEFAULT_ICONS,
    inline = false,
    iconPos='right',
    style = {},
    className = '',
    color = 'secondary',
    labels=[null,null],
}) {
    const [active, setActive] = useState(checked);
    const Icon = checked ? icons.enabled : icons.disabled;
    const onClickedBox = useCallback(() => {
        const newval = !checked;
        onClick(newval);
        return newval;

        // setActive(v => {
        //     const newval = !v;
        //     onClick(newval);
        //     return newval;
        // });
    }, [checked]);

    // overwrite text if labels exist:
    text = labels[active ? 0 : 1] ?? text;

    if (inline) return <div className={`d-inline-block hover-dark hover-${color} ${className}`}
        onClick={onClickedBox}
        style={{ cursor: 'pointer', ...style }}>
        {iconPos === 'left' ? (<div className=''>
            <Icon fill='currentColor' height='1rem' />
            <small className='mx-1'>{text}</small>
        </div>) : (<>
            <small className='mx-1'>{text}</small>
            <Icon fill='currentColor' height='1rem' />
        </>)}
    </div>;

    return <div className={'btn p-0 no-shadow hover-dark hover-secondary ' + className}
        onClick={onClickedBox}
        style={{ ...style }}>
        <div className='col text-center'>
            <div className='row'>
                <small className='me-0'>{text}</small>
            </div>
            <div className='d-inline'>
                <Icon height='1rem' fill='currentColor' />
            </div>
        </div>
    </div>;
}
