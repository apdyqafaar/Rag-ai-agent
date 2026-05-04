import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"

export function ProgressWithLabel({states, progress}:{states:string, progress:number}) {
  return (
    <Field className="w-full ">
      <FieldLabel htmlFor="progress-upload">
        <span>{states||""}</span>
        <span className="ml-auto">{progress||0}%</span>
      </FieldLabel>
      <Progress value={progress} id="progress-upload" />
    </Field>
  )
}
