import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import cx from 'classnames';
import {v4 as genId} from 'uuid';

import { VisualisationContext } from '../../utils/contexts';

/**
 * Viz caller, the place of the viz in contents
 * @param {Object} props Viz parameters
 * @param {String} props.id Viz id
 * @returns {React.ReactElement}
 */

export default function Caller ({
    id: visualizationId,
    className,
    children,
    ...props
}) {
    const ref = useRef(null);
    /** @type {[String, Function]} */
    const [callerId, setCallerId] = useState(genId());
    const isInblock = className === 'is-inblock';
    const isInvalid = className === 'is-invalid';
    const isBlank = className === 'is-blank';

    const {
        onRegisterVisualization,
        onClickCallerScroll,
        activeCallerId
    } = useContext(VisualisationContext);

    const callerPayload = useMemo(() => {
        let callerProps = {...props}
        if (Object.keys(callerProps).length === 0) {
            callerProps = undefined;
        }
        return {
            props: callerProps,
            canFocusOnScroll: isInblock ? false : true,
            ref,
            visualizationId,
            callerId
        }
    }, [className, ref, visualizationId, callerId]);

    useEffect(() => {
        if (isInvalid || isBlank) { return; }

        setTimeout(() => {
            // we wrap callback in a setTimeout in order to have a non-null ref to the HTML element
            onRegisterVisualization(callerPayload);
        });
    }, [callerId]);

    if (isInblock) {
        return (
            <span
                ref={ref}
                id={visualizationId}
                className={cx('Caller', {
                    'is-invalid': isInvalid,
                    'is-inline': isInblock,
                    'is-active': activeCallerId && activeCallerId === callerId
                })}
                onClick={(e) => onClickCallerScroll(callerPayload)}
            >{children}</span>
        )
    }

    return (
        <span
            ref={ref}
            id={visualizationId}
            className={cx('Caller', {
                'is-invalid': isInvalid,
                'is-blank': isBlank,
                'is-active': activeCallerId && activeCallerId === callerId
            })}
            onClick={(e) => onClickCallerScroll(callerPayload)}
        >
            {
               process.env.NODE_ENV === 'development' &&
                <span>Caller viz&nbsp;
                    <code>{visualizationId}</code> : <code>{JSON.stringify({ ...props })}</code>
                </span>
            }
        </span>
    )
}