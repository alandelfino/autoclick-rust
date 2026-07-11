import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "../../../hooks/use-toast";

import { SaveIcon } from "lucide-react";
import z from "zod";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../../../components/ui/field";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Card, CardContent } from "../../../components/ui/card";

export const Route = createFileRoute('/dashboard/settings/')({
    component: Settings,
})

const formSchema = z.object({
    hiddeWindows: z.boolean().default(false),
    autoSave: z.boolean().default(false),
    countdownSeconds: z.number().default(3),
    minZoom: z.number().default(0.1),
    maxZoom: z.number().default(3),
    connectionsStrokeWidth: z.number().default(2),
    connectionsStroke: z.string().default("#ececec"),
});

function Settings() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            hiddeWindows: false,
            autoSave: false,
            countdownSeconds: 3,
            minZoom: 0.1,
            maxZoom: 3,
            connectionsStrokeWidth: 2,
            connectionsStroke: "#ececec",
        },
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const config = await invoke<z.infer<typeof formSchema>>("get_settings");
                form.reset(config);
            } catch (err) {
                console.error("Failed to load settings:", err);
            }
        };
        loadSettings();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await invoke("save_settings", { config: values });
            toast({
                title: "Configurações salvas!",
                description: "Suas preferências foram gravadas com sucesso no arquivo config.",
                variant: "success",
            });
        } catch (err) {
            console.error("Failed to save settings:", err);
            toast({
                title: "Erro ao salvar!",
                description: "Não foi possível gravar as configurações.",
                variant: "destructive",
            });
        }
    }

    function onReset() {
        form.reset();
        form.clearErrors();
    }



    return (
        <main className="w-full max-w-container mx-auto flex flex-1 flex-col min-h-0 px-4">

            {/* Page content */}
            <div className="flex flex-1 flex-col gap-2 py-1 min-h-0 px-4 justify-center">

                <div className="w-full max-w-[480px] mx-auto flex flex-col items-center mb-4">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-sm text-muted-foreground">Configure the settings for the application</p>
                </div>

                <Card className="w-full max-w-[480px] mx-auto">
                    <CardContent>
                        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>


                                <Controller
                                    name="hiddeWindows"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex w-full items-center">
                                                <div className="w-full">
                                                    <FieldLabel htmlFor="form-rhf-demo-hiddeWindows">
                                                        Hidde Windows
                                                    </FieldLabel>
                                                    <FieldDescription>Hide all the windows of the application when not in use.</FieldDescription>
                                                </div>
                                                <Switch checked={!!field.value} onCheckedChange={field.onChange} id="form-rhf-demo-hiddeWindows" />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="autoSave"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex w-full items-center">
                                                <div className="w-full">
                                                    <FieldLabel htmlFor="form-rhf-demo-autoSave">
                                                        Auto Save
                                                    </FieldLabel>
                                                    <FieldDescription>Auto save when changes are made.</FieldDescription>
                                                </div>
                                                <Switch checked={!!field.value} onCheckedChange={field.onChange} id="form-rhf-demo-autoSave" />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />


                                <Controller
                                    name="countdownSeconds"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex w-full items-center">
                                                <div className="w-full">
                                                    <FieldLabel htmlFor="form-rhf-demo-countdownSeconds">
                                                        Countdown Seconds
                                                    </FieldLabel>
                                                    <FieldDescription>Time to wait before starting the countdown.</FieldDescription>
                                                </div>
                                                <Input
                                                    {...field}
                                                    id="form-rhf-demo-countdownSeconds"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="0"
                                                    autoComplete="off"
                                                    type="number"
                                                    className="max-w-16"
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                />
                                            </div>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="minZoom"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex items-center w-full">
                                                <div className="w-full">
                                                    <FieldLabel htmlFor="form-rhf-demo-minZoom">
                                                        Min Zoom
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        Minimum zoom level to use on canvas.
                                                    </FieldDescription>
                                                </div>
                                                <Input
                                                    {...field}
                                                    id="form-rhf-demo-minZoom"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="0.1"
                                                    autoComplete="off"
                                                    type="number"
                                                    className="max-w-16"
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="maxZoom"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex items-center w-full gap-4">
                                                <div className="w-full">
                                                    <FieldLabel htmlFor="form-rhf-demo-maxZoom">
                                                        Max Zoom
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        Maximum zoom level to use on canvas.
                                                    </FieldDescription>
                                                </div>
                                                <Input
                                                    {...field}
                                                    id="form-rhf-demo-maxZoom"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="3.0"
                                                    autoComplete="off"
                                                    type="number"
                                                    className="max-w-16"
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="connectionsStrokeWidth"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex items-center w-full gap-4">
                                                <div className="w-full">
                                                    <FieldLabel htmlFor="form-rhf-demo-connectionsStrokeWidth">
                                                        Connections Stroke Width
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        The width of the connections on canvas.
                                                    </FieldDescription>
                                                </div>
                                                <Input
                                                    {...field}
                                                    id="form-rhf-demo-connectionsStrokeWidth"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="1"
                                                    autoComplete="off"
                                                    type="number"
                                                    className="max-w-16"
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="connectionsStroke"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex items-center w-full gap-4">
                                                <div className="w-full">
                                                    <FieldLabel htmlFor="form-rhf-demo-connectionsStroke">
                                                        Connections Stroke
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        The color of the connections on canvas.
                                                    </FieldDescription>
                                                </div>
                                                <Input
                                                    {...field}
                                                    id="form-rhf-demo-connectionsStroke"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Connections Stroke"
                                                    autoComplete="off"
                                                    type="color"
                                                    className="max-w-16"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />

                                {/* Toast messages are handled globally */}

                                <div className="grid grid-cols-2 w-full gap-2">
                                    <Button variant="outline" type="button" onClick={onReset}>
                                        Cancel
                                    </Button>
                                    <Button variant="default" type="submit" disabled={form.formState.isSubmitting} className="">
                                        <SaveIcon /> Save
                                    </Button>
                                </div>

                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>

            </div>

        </main>
    )
}