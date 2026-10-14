import React, { useMemo } from "react";
import Select from "react-select";

function flattenOptions(children, output = []) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      flattenOptions(child.props.children, output);
      return;
    }
    if (typeof child.type === "string" && child.type.toLowerCase() === "option") {
      output.push(child);
      return;
    }
    // Option lists are often returned from .map(); arrays are flattened by
    // React.Children, so non-option wrappers are intentionally not interpreted.
  });
  return output;
}

function SearchableSelect({
  children,
  value,
  defaultValue,
  onChange,
  onBlur,
  multiple = false,
  disabled = false,
  required = false,
  name,
  id,
  className = "",
  ...rest
}) {
  const sourceOptions = useMemo(() => flattenOptions(children), [children]);
  const placeholderOption = sourceOptions.find((option) => String(option.props.value ?? "") === "");
  const options = sourceOptions
    .filter((option) => String(option.props.value ?? "") !== "")
    .map((option) => ({ value: String(option.props.value ?? ""), label: option.props.children ?? String(option.props.value ?? ""), isDisabled: Boolean(option.props.disabled) }))
    .sort((a, b) => String(a.label ?? "").localeCompare(String(b.label ?? ""), undefined, { sensitivity: "base" }));
  const selectedValue = value !== undefined ? value : defaultValue;
  const selected = multiple
    ? options.filter((option) => (Array.isArray(selectedValue) ? selectedValue : []).map(String).includes(option.value))
    : options.find((option) => option.value === String(selectedValue ?? "")) || null;
  const placeholder = placeholderOption?.props.children ?? "Select an option";

  const handleChange = (next) => {
    const nextOptions = Array.isArray(next) ? next : next ? [next] : [];
    const nextValue = multiple ? nextOptions.map((option) => option.value) : (nextOptions[0]?.value ?? "");
    if (onChange) {
      const selectedOptions = nextOptions.map((option) => ({ value: option.value, label: option.label }));
      onChange({
        target: {
          name,
          id,
          value: nextValue,
          options: options.map((option) => ({ value: option.value, label: option.label, selected: nextOptions.some((selectedOption) => selectedOption.value === option.value) })),
          selectedOptions,
          multiple,
        },
      });
    }
  };

  return (
    <Select
      inputId={id}
      name={name}
      options={options}
      value={selected}
      onChange={handleChange}
      onBlur={onBlur}
      isMulti={multiple}
      isDisabled={disabled}
      isSearchable
      isClearable={!required && !multiple}
      required={required}
      placeholder={placeholder}
      className={className}
      classNamePrefix="react-select"
      styles={{
        container: (base) => ({ ...base, width: "100%", minWidth: 0 }),
        control: (base, state) => ({ ...base, minHeight: 40, borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,.15)" : "none", "&:hover": { borderColor: "#93c5fd" } }),
        menu: (base) => ({ ...base, zIndex: 80 }),
        valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
        ...rest.styles,
      }}
      noOptionsMessage={() => "No options found"}
      {...rest}
    />
  );
}

export default SearchableSelect;
