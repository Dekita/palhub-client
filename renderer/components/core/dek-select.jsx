/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################

<DekSelect onChange={(event, value)=>{}}>
    <dekItem text='Option 1' active/>
    <dekItem text='Option 2'/>
    <dekItem text='Option 3'/>
    <dekItem text='Option 4'/>
</DekSelect> 
*/

import { useState, useRef, useMemo, useEffect, Children } from 'react';

// import styles from '../styles/dekselect.module.css';
import IconDown from '@svgs/fa5/solid/arrow-down.svg';
import IconList from '@svgs/fa5/solid/list-ul.svg';

function useOnClickOutside(ref, callback) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                // alert("You clicked outside of me!");
                if (callback) callback(event);
            }
        }
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);
}

export default function DekSelect({
    children,
    onChange,
    active_id,
    uid,
    disableInput = false,
}) {
    const child_array = Children.toArray(children);
    const active = useMemo(()=>child_array.find((c, index) => {
        return c.props.active || active_id === index;
    }), [child_array, active_id]);
    const selected_text = useMemo(()=>active?.props?.text || 'not-selected', [active]);
    const [showUL, setShowUL] = useState(false);

    // const ref = useOnClickOutside((e)=>{
    //     console.log('ref-e:', uid === e.target?.id);
    //     setShowUL(false);
    // });

    const ref = useRef(null);
    useOnClickOutside(ref, () => setShowUL(false));

    // when main element is clicked
    const onClickElement = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (disableInput) return;
        setShowUL((old) => !old);
    };
    // when list item is clicked
    const onClickItem = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const index = [].slice
            .call(event.target.parentNode.children)
            .indexOf(event.target);
        // setSelected(event.target.innerText);
        onChange(event, selected_text, event.target.innerText, index);
        setShowUL(false);
    };

    const IconComponent = showUL ? IconDown : IconList;

    const mainclasses = [
        'form-control btn-select dekselect-secondary',
        showUL ? 'active' : '',
    ].join(' ');

    return (
        <div
            className={mainclasses}
            onClick={onClickElement}
            disabled={disableInput}
            ref={ref}
            id={uid}>
            <small className='btn-select-value form-control'>{selected_text}</small>
            <span className='btn-select-arrow text-center'>
                <IconComponent width={16} height={16} fill='currentColor' />
            </span>
            <ul className={showUL ? 'd-block thin-scroller' : 'd-none'}>
                {child_array.map((child) => {
                    const { text, id } = child.props;
                    // console.log('child:', child);
                    const has_children = Children.toArray(
                        child.props.children
                    ).length;
                    const thischild = has_children
                        ? child.props.children
                        : text;
                    return (
                        <li id={id} key={child.key || id} onClick={onClickItem}>
                            {thischild}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
