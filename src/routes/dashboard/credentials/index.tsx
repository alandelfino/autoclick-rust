import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../../../components/ui/button";
import { EllipsisVerticalIcon, FunnelIcon, PlusIcon, Search, Trash2, Edit3 } from "lucide-react";
import { Card, CardContent, CardDescription } from "../../../components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { useGenericList } from "../../../hooks/useGenericList";
import { GenericPagination } from "../../../components/ui/generic-pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { CredentialDialog } from "./-components/credential-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Empty } from "../../../components/ui/empty";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute('/dashboard/credentials/')({
    component: Credentials,
})

interface Credential {
    id: string;
    name: string;
    type: string;
    value1?: string | null;
    value2?: string | null;
    value3?: string | null;
}

function Credentials() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
    const [credentialToDelete, setCredentialToDelete] = useState<Credential | null>(null);

    // Load credentials from SQLite via Tauri
    const loadCredentials = async () => {
        setIsLoading(true);
        try {
            const data = await invoke<Credential[]>("list_credentials");
            setCredentials(data);
        } catch (err) {
            console.error("Failed to load credentials:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCredentials();
    }, []);

    // Delete credential
    const handleDeleteCredential = async () => {
        if (!credentialToDelete) return;
        try {
            await invoke("delete_credential", { id: credentialToDelete.id });
            setCredentialToDelete(null);
            loadCredentials();
        } catch (err) {
            console.error("Failed to delete credential:", err);
        }
    };

    // Sort options
    const sortOptions = [
        { label: "Nome (A-Z)", value: "name-asc" },
        { label: "Nome (Z-A)", value: "name-desc" },
    ];

    // Generic list hook
    const {
        searchTerm,
        setSearchTerm,
        sortValue,
        setSortValue,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        activePage,
        paginatedItems,
    } = useGenericList<Credential>({
        items: credentials,
        searchFields: ["name", "type"],
        defaultSort: "name-asc",
    });

    const handleNewCredential = () => {
        setSelectedCredential(null);
        setIsFormOpen(true);
    };

    const handleEditCredential = (cred: Credential) => {
        setSelectedCredential(cred);
        setIsFormOpen(true);
    };

    return (
        <main className="w-full max-w-container mx-auto flex flex-1 flex-col min-h-0">
            {/* Page header */}
            <div className="flex items-center justify-between pt-6 pb-4 shrink-0 px-4">
                <div>
                    <h1 className="text-xl font-bold">My Credentials</h1>
                    <p className="text-sm text-muted-foreground">Manage and configure your database and API credentials</p>
                </div>

                <Button className="flex items-center rounded-sm" onClick={handleNewCredential}>
                    <PlusIcon /> New Credential
                </Button>
            </div>

            {/* Page content */}
            <div className="flex flex-1 flex-col gap-2 py-1 min-h-0 px-4">
                {/* Filters */}
                <div className="flex items-center gap-1 w-full justify-end shrink-0">
                    <InputGroup className="max-w-xs rounded-sm">
                        <InputGroupInput 
                            placeholder="Pesquisar..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <Select value={sortValue} onValueChange={(val) => val && setSortValue(val)} items={sortOptions}>
                        <SelectTrigger className="w-fit rounded-sm text-xs text-muted-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-fit">
                            <SelectGroup>
                                <SelectLabel>Ordenar por:</SelectLabel>
                                {sortOptions.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="rounded-sm" size="icon">
                        <FunnelIcon className="size-3.5 text-muted-foreground" />
                    </Button>
                </div>

                {/* Credentials list */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-1 py-2">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Carregando credenciais...</div>
                    ) : paginatedItems.length === 0 ? (
                        <Empty 
                            title="Nenhuma credencial encontrada" 
                            description="Configure uma nova credencial para conectar seus bancos de dados e APIs."
                            icon={<KeyRound className="size-6" />}
                        />
                    ) : (
                        paginatedItems.map((cred) => (
                            <Card key={cred.id} className="flex-none bg-neutral-50/30 hover:shadow-lg hover:shadow-neutral-100 transition-shadow rounded-sm">
                                <CardContent>
                                    <CardDescription className="flex items-center">
                                        <div className="w-full">
                                            <div className="font-semibold text-md text-neutral-900">{cred.name}</div>
                                            <span className="text-xs uppercase text-teal-600 font-semibold px-2 py-0.5 bg-teal-50 border border-teal-100 rounded-full mr-2 inline-block">
                                                {cred.type}
                                            </span>
                                            <span className="text-xs text-muted-foreground">ID: {cred.id}</span>
                                        </div>
                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm">
                                                    <EllipsisVerticalIcon />
                                                </Button>} />
                                                <DropdownMenuContent align="center">
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem onClick={() => handleEditCredential(cred)}>
                                                            <Edit3 className="size-4 mr-2 inline" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => setCredentialToDelete(cred)}
                                                        >
                                                            <Trash2 className="size-4 mr-2 inline" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Reusable Pagination */}
            {!isLoading && credentials.length > 0 && (
                <GenericPagination
                    totalItems={totalItems}
                    activePage={activePage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            )}

            {/* Registration Modal Dialog */}
            <CredentialDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                credential={selectedCredential}
                onSave={loadCredentials}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={credentialToDelete !== null} onOpenChange={(open) => !open && setCredentialToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="size-5" /> Excluir Credencial
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir a credencial <strong>{credentialToDelete?.name}</strong>? Esta ação é definitiva e não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCredentialToDelete(null)}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteCredential}
                        >
                            Excluir Definitivamente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}