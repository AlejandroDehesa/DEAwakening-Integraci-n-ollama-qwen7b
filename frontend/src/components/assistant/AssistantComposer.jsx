function AssistantComposer({
  inputId,
  inputLabel,
  placeholder,
  value,
  onChange,
  onSubmit,
  isSending,
  sendLabel,
  inputRef,
  className = ""
}) {
  return (
    <form className={`assistant-form ${className}`.trim()} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={inputId}>
        {inputLabel}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={4000}
      />
      <button type="submit" className="btn btn-primary" disabled={isSending}>
        {sendLabel}
      </button>
    </form>
  );
}

export default AssistantComposer;
