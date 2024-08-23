import { cva, type VariantProps } from 'class-variance-authority';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'group flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'web:hover:opacity-90 active:opacity-90',
        destructive: 'bg-destructive web:hover:opacity-90 active:opacity-90',
        outline:
          'border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent',
        secondary: 'bg-secondary web:hover:opacity-80 active:opacity-80',
        ghost: 'web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent',
        link: 'web:underline-offset-4 web:hover:underline web:focus:underline ',
      },
      size: {
        default: 'min-h-10 px-4 py-2 native:min-h-12 native:px-5 native:py-3',
        sm: 'min-h-9 rounded-md px-3',
        lg: 'min-h-11 rounded-md px-8 native:min-h-16',
        icon: 'min-h-10 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  'web:whitespace-nowrap text-lg text-foreground web:transition-colors leading-6',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground font-bold2',
        destructive: 'text-destructive-foreground',
        outline: 'group-active:text-accent-foreground',
        secondary: 'text-secondary-foreground group-active:text-secondary-foreground font-medium2',
        ghost: 'group-active:text-accent-foreground',
        link: 'text-primary group-active:underline',
      },
      size: {
        default: '',
        sm: '',
        lg: 'native:text-2xl',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <TextClassContext.Provider
        value={cn(
          props.disabled && 'web:pointer-events-none',
          buttonTextVariants({ variant, size }),
        )}
      >
        {!variant || variant === 'default' ? (
          <LinearGradient
            colors={['#FFE951', '#FFC453']}
            start={[0, 0]}
            end={[1, 1]}
            style={{ borderRadius: 16, elevation: 2 }}
          >
            <Pressable
              className={cn(
                props.disabled && 'opacity-50 web:pointer-events-none',
                buttonVariants({ variant, size, className }),
              )}
              ref={ref}
              role="button"
              {...props}
            />
          </LinearGradient>
        ) : (
          <Pressable
            className={cn(
              props.disabled && 'opacity-50 web:pointer-events-none',
              buttonVariants({ variant, size, className }),
            )}
            style={{ elevation: variant === "ghost" ? 0 : 2 }}
            ref={ref}
            role="button"
            {...props}
          />
        )}
      </TextClassContext.Provider>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
