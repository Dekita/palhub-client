/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/
import * as CommonIcons from 'config/common-icons';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_ICONS = {
    enabled: CommonIcons.tog_enabled,
    disabled: CommonIcons.tog_disabled,
};

export default function DekSwitch({
    text = '',
    checked = false,
    onClick = () => {},
    icons = DEFAULT_ICONS,
    style = {},
    className = '',
    color='secondary',
    labels=['On','Off'],
    maxIconWidth=null,
}) {
    // const [active, setActive] = useState(checked);
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
    text = labels[checked ? 0 : 1] ?? text;

    return <>
        <div className={'' + className} style={{ ...style }}>
            <div className='btn-group dek-switch w-100' role="group" style={{minWidth: 128}} onClick={onClickedBox} >
                <div className={`btn btn-dark hover-${color} text-center px-0 py-1`} style={{maxWidth: maxIconWidth}}>
                    <Icon fill='currentColor' height='1rem' />
                </div>
                <div className={'btn '+(checked ? `btn-${color}` : `btn-dark hover-${color}`)}>
                    {text}
                </div>
            </div>
            {/* {!!text && <p className='d-inline px-2'>{text}</p>} */}
        </div>
    </>
}
