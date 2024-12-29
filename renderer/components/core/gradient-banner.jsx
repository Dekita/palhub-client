
export default function GradientBanner({height=69, a='info', b='secondary', children}) {
    const gradient_a = `bg-gradient-${a}-to-${b} border-${a}`;
    const gradient_b = `bg-${b} border-${a}`;
    const gradient_c = `bg-gradient-${b}-to-${a} border-${a}`;
    return <div className='position-relative'>
        <div className='row mb-2'  style={{height}}>
            <div className={`col transition-all border border-4 border-end-0 radius9 no-radius-end ${gradient_a}`}></div>
            <div className={`col transition-all border border-4 border-start-0 border-end-0 ${gradient_b}`}></div>
            <div className={`col transition-all border border-4 border-start-0 radius9 no-radius-start ${gradient_c}`}></div>
        </div>
        <div className='position-absolute top-0 w-100 p-1 py-2'>
            {children}
        </div>
    </div>
}