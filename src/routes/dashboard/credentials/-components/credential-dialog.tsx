import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Field, FieldLabel } from "../../../../components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { invoke } from "@tauri-apps/api/core";

interface Credential {
    id: string;
    name: string;
    type: string;
    value1?: string | null;
    value2?: string | null;
    value3?: string | null;
}

interface CredentialDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    credential: Credential | null;
    onSave: () => void;
}

const credentialTypes = [
    { label: "PostgreSQL", value: "postgre" },
    { label: "MySQL", value: "mysql" },
    { label: "SQLite", value: "sqlite" },
    { label: "API Request", value: "api" },
];

export function CredentialDialog({
    open,
    onOpenChange,
    credential,
    onSave,
}: CredentialDialogProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState("postgre");
    const [value1, setValue1] = useState("");
    const [value2, setValue2] = useState("");
    const [value3, setValue3] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (credential) {
            setName(credential.name);
            setType(credential.type);
            setValue1(credential.value1 || "");
            setValue2(credential.value2 || "");
            setValue3(credential.value3 || "");
        } else {
            setName("");
            setType("postgre");
            setValue1("");
            setValue2("");
            setValue3("");
        }
    }, [credential, open]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            if (credential) {
                // Update
                await invoke("update_credential", {
                    id: credential.id,
                    name,
                    type,
                    value1: value1 || null,
                    value2: value2 || null,
                    value3: value3 || null,
                });
            } else {
                // Create
                await invoke("create_credential", {
                    name,
                    type,
                    value1: value1 || null,
                    value2: value2 || null,
                    value3: value3 || null,
                });
            }
            onSave();
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save credential:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const getValueLabels = () => {
        switch (type) {
            case "postgre":
            case "mysql":
                return {
                    val1: "Host / Connection URL",
                    val2: "Username",
                    val3: "Password",
                    showVal2: true,
                    showVal3: true,
                };
            case "sqlite":
                return {
                    val1: "Database Path File",
                    val2: "",
                    val3: "",
                    showVal2: false,
                    showVal3: false,
                };
            case "api":
                return {
                    val1: "Base URL",
                    val2: "Headers (JSON format)",
                    val3: "Auth Token / API Key",
                    showVal2: true,
                    showVal3: true,
                };
            default:
                return {
                    val1: "Value 1",
                    val2: "Value 2",
                    val3: "Value 3",
                    showVal2: true,
                    showVal3: true,
                };
        }
    };

    const labels = getValueLabels();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>
                            {credential ? "Editar Credencial" : "Nova Credencial"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        <Field>
                            <FieldLabel htmlFor="cred-name">Nome</FieldLabel>
                            <Input
                                id="cred-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Minha Credencial"
                                required
                                autoComplete="off"
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="cred-type">Tipo</FieldLabel>
                            <Select
                                value={type}
                                onValueChange={(val) => val && setType(val)}
                                items={credentialTypes}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {credentialTypes.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="cred-val1">{labels.val1}</FieldLabel>
                            <Input
                                id="cred-val1"
                                value={value1}
                                onChange={(e) => setValue1(e.target.value)}
                                placeholder={`Insira ${labels.val1.toLowerCase()}`}
                                autoComplete="off"
                            />
                        </Field>

                        {labels.showVal2 && (
                            <Field>
                                <FieldLabel htmlFor="cred-val2">{labels.val2}</FieldLabel>
                                <Input
                                    id="cred-val2"
                                    value={value2}
                                    onChange={(e) => setValue2(e.target.value)}
                                    placeholder={`Insira ${labels.val2.toLowerCase()}`}
                                    autoComplete="off"
                                />
                            </Field>
                        )}

                        {labels.showVal3 && (
                            <Field>
                                <FieldLabel htmlFor="cred-val3">{labels.val3}</FieldLabel>
                                <Input
                                    id="cred-val3"
                                    type="password"
                                    value={value3}
                                    onChange={(e) => setValue3(e.target.value)}
                                    placeholder={`Insira ${labels.val3.toLowerCase()}`}
                                    autoComplete="off"
                                />
                            </Field>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving || !name.trim()}>
                            {isSaving ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
