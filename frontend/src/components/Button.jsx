import {Slot} from '@radix-ui/react-slot';
import {cva} from 'class-variance-authority';
import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
const variants=cva('button',{variants:{variant:{primary:'primary',outline:'outline',ghost:'ghost'}},defaultVariants:{variant:'primary'}});
export function Button({asChild=false,variant,className,...props}){const Component=asChild?Slot:'button';return <Component className={twMerge(clsx(variants({variant}),className))} {...props}/>;}
