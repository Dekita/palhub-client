/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

export default function DekSlider({label, disabled=false, min=0, max=99, step=1, value=0, thin=false, onChange=()=>{}}) {
    const perc = Math.round((value-min)/(max-min)*100);
    const background = `linear-gradient(to right, var(--dek-info-normal) 0%, var(--dek-secondary-normal) ${perc}%, transparent ${perc}%)`;
    return <div>
        {label && <label className='form-label px-1'>{label}</label>}
        <div className='w-100 btn btn-dark hover-secondary border-3 p-0'>
            <input 
                type='range' disabled={disabled}
                style={{background}}
                className={'form-secondary form-range custom-range' + (thin ? ' thin' : '')} 
                {...{min,max,step,value,onChange}}  
            />
        </div>
    </div>
}