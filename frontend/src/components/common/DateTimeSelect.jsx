import { useState, useRef, useEffect } from 'react'

export const CustomSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div 
        className="cursor-pointer px-2 py-1 hover:text-primary text-sm font-bold transition-colors" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
      </div>
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-[9999] py-1 min-w-[3.5rem] no-scrollbar">
          {options.map(opt => (
            <div 
              key={opt}
              className={`px-2 py-1.5 text-center text-sm cursor-pointer transition-colors ${value === opt ? 'bg-primary text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DateTimeSelect = ({ label, value, onChange, icon: Icon }) => {
  const datePart = value.split('T')[0] || '';
  const timePart = value.split('T')[1] || '00:00';
  const [hour, minute] = timePart.split(':');
  
  const hourOptions = Array.from({length: 24}).map((_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({length: 60}).map((_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="space-y-1 w-full">
      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 pl-1">
        {Icon && <Icon size={14} className="text-slate-400" />} {label}
      </label>
      <div className="flex gap-2 w-full">
        <input 
          type="date" 
          value={datePart}
          onChange={e => onChange(`${e.target.value}T${timePart}`)}
          className="w-full min-w-[120px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
        />
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1">
          <CustomSelect 
            value={hour} 
            options={hourOptions}
            onChange={val => onChange(`${datePart}T${val}:${minute}`)}
          />
          <span className="font-bold text-slate-400 pb-0.5">:</span>
          <CustomSelect 
            value={minute} 
            options={minuteOptions}
            onChange={val => onChange(`${datePart}T${hour}:${val}`)}
          />
        </div>
      </div>
    </div>
  )
}
