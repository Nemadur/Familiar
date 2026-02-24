import { type Control, Controller, type FieldValues, type Path } from "react-hook-form";
import { OutlineClose } from "@/components/icons/icons";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface Option {
  id: string;
  label: string;
  price?: number;
  pricePercentage?: number;
  description?: string;
  included?: boolean;
  hasInput?: boolean;
  disabled?: boolean;
}

interface FormBlockProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  options: Option[];
  otherFieldName?: Path<T>;
}

export function FormRadioGroup<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  options,
  className,
  otherFieldName,
}: FormBlockProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldSet className={className}>
          <div className="flex items-center justify-between">
            <FieldLegend>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FieldLegend>
            <span className="text-muted-foreground/70 text-xs">Choose 1</span>
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            className="flex flex-col gap-3"
          >
            {options.map((option) => (
              <Field key={option.id} orientation="horizontal" className="items-start">
                <RadioGroupItem
                  value={option.id}
                  id={`${name}-${option.id}`}
                  disabled={option.disabled}
                />
                <FieldContent className="flex-1 gap-2">
                  <div className="flex items-start justify-between">
                    <FieldLabel
                      htmlFor={`${name}-${option.id}`}
                      className={cn(
                        "cursor-pointer font-normal leading-tight",
                        option.disabled && "text-muted-foreground/70"
                      )}
                    >
                      {option.label}
                    </FieldLabel>
                    {option.price !== undefined && (
                      <span className="ml-2 whitespace-nowrap text-muted-foreground text-xs">
                        {option.price > 0 ? `+PLN ${option.price.toFixed(2)}` : "Free"}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <FieldDescription className="text-xs">{option.description}</FieldDescription>
                  )}
                  {option.hasInput && field.value === option.id && otherFieldName && (
                    <Controller
                      control={control}
                      name={otherFieldName}
                      render={({ field: otherField }) => (
                        <Input
                          placeholder="Please specify..."
                          className="mt-1 h-10 border-transparent bg-secondary/20 focus:border-primary"
                          {...otherField}
                        />
                      )}
                    />
                  )}
                </FieldContent>
              </Field>
            ))}
          </RadioGroup>
          <FieldError errors={[fieldState.error]} />
        </FieldSet>
      )}
    />
  );
}

export function FormCheckboxGroup<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  options,
  className,
  otherFieldName,
}: FormBlockProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value as string[]) || [];

        return (
          <FieldSet className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
              <FieldLegend className="font-medium text-base">
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
              </FieldLegend>
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldGroup className="gap-3">
              {options.map((option) => {
                const isIncluded = option.included;
                // Unavailable if not included and price is 0/undefined (and no percentage)
                // This assumes standard licenses have a price if they are optional.
                // If an artist offers a free optional license, this logic might need tweaking,
                // but usually "Included" means mandatory.
                const isUnavailable = !isIncluded && (option.price === 0 || option.price === undefined) && option.pricePercentage === undefined;

                const isChecked = value.includes(option.id) || isIncluded;

                return (
                  <Field key={option.id} orientation="horizontal" className="items-start">
                    {isUnavailable ? (
                      <OutlineClose size={16} className="cursor-not-allowed text-muted-foreground/70" />
                    ) : (
                      <Checkbox
                        id={`${name}-${option.id}`}
                        checked={isChecked}
                        disabled={isIncluded || option.disabled}
                        onCheckedChange={(checked) => {
                          if (isIncluded || option.disabled) return;
                          let newValue = [...value];
                          if (checked) {
                            newValue.push(option.id);
                          } else {
                            newValue = newValue.filter((v) => v !== option.id);
                          }
                          field.onChange(newValue);
                        }}
                      />
                    )}

                    <FieldContent className="flex-1">
                      <div className="flex items-start justify-between">
                        <FieldLabel
                          htmlFor={`${name}-${option.id}`}
                          className={cn(
                            "cursor-pointer font-normal",
                            (isIncluded || option.disabled || isUnavailable) && "cursor-not-allowed text-muted-foreground/70",
                            isUnavailable && "line-through"
                          )}
                        >
                          {option.label}
                        </FieldLabel>
                        <span className="whitespace-nowrap text-muted-foreground/70 text-xs">
                          {option.pricePercentage !== undefined
                            ? `+${option.pricePercentage}%`
                            : isIncluded
                              ? "Included"
                              : option.price !== undefined && option.price > 0
                                ? `+PLN ${option.price.toFixed(2)}`
                                : ""}
                        </span>
                      </div>
                      {option.description && (
                        <FieldDescription className="mt-1">{option.description}</FieldDescription>
                      )}
                      {option.hasInput && isChecked && otherFieldName && (
                        <div className="mt-2 pl-2">
                          <Controller
                            control={control}
                            name={otherFieldName}
                            render={({ field: otherField }) => (
                              <Input
                                placeholder="Please specify..."
                                className="h-10 border-transparent bg-secondary/20 focus:border-primary"
                                {...otherField}
                              />
                            )}
                          />
                        </div>
                      )}
                    </FieldContent>
                  </Field>
                );
              })}
            </FieldGroup>
            <FieldError errors={[fieldState.error]} />
          </FieldSet>
        );
      }}
    />
  );
}
