"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group border-2 border-main-blue bg-white text-foreground rounded-lg shadow-lg",
          title: "text-foreground font-semibold",
          description: "text-muted-foreground text-sm",
          actionButton: "bg-main-blue text-white",
          cancelButton: "bg-muted text-muted-foreground",
          success: "border-success-green",
          error: "border-error-red",
          info: "border-main-blue",
          warning: "border-warning-yellow",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
