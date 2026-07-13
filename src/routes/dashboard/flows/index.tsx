import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "../../../components/ui/button";
import { EllipsisVerticalIcon, FunnelIcon, PlusIcon, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription } from "../../../components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { useGenericList } from "../../../hooks/useGenericList";
import { GenericPagination } from "../../../components/ui/generic-pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { invoke } from "@tauri-apps/api/core";
import { Empty } from "../../../components/ui/empty";
import { FolderOpen } from "lucide-react";

export const Route = createFileRoute('/dashboard/flows/')({
    component: Flows,
})

interface Flow {
    id: string;
    name: string;
}

function Flows() {
    const navigate = useNavigate();
    const [flows, setFlows] = useState<Flow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");

    // Fetch flows from backend
    const loadFlows = async () => {
        setIsLoading(true);
        try {
            const data = await invoke<Flow[]>("list_flows");
            setFlows(data);
        } catch (err) {
            console.error("Failed to load flows:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFlows();
    }, []);

    // Create flow and redirect
    const handleCreateFlow = async () => {
        try {
            const defaultName = `Flow #${flows.length + 1}`;
            const id = await invoke<string>("create_flow", { name: defaultName });
            navigate({ to: "/dashboard/flow", search: { id } });
        } catch (err) {
            console.error("Failed to create flow:", err);
        }
    };

    // Delete flow
    const handleDeleteFlow = async () => {
        if (!flowToDelete) return;
        try {
            await invoke("delete_flow", { id: flowToDelete.id });
            setFlowToDelete(null);
            setDeleteConfirmName("");
            loadFlows();
        } catch (err) {
            console.error("Failed to delete flow:", err);
        }
    };

    // Generic list sorting options
    const sortOptions = [
        { label: "Name (A-Z)", value: "name-asc" },
        { label: "Name (Z-A)", value: "name-desc" },
    ];

    // Initialize custom hook
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
    } = useGenericList<Flow>({
        items: flows,
        searchFields: ["name"],
        defaultSort: "name-asc",
    });

    return (
        <main className="w-full max-w-container mx-auto flex flex-1 flex-col min-h-0">
            {/* Page header */}
            <div className="flex items-center justify-between pt-6 pb-4 shrink-0 px-4">
                <div>
                    <h1 className="text-xl font-bold">My Flows</h1>
                    <p className="text-sm text-muted-foreground">Manage and create your automation flows</p>
                </div>

                <Button className="flex items-center" onClick={handleCreateFlow}>
                    <PlusIcon /> New Flow
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

                {/* Flows list */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-1 py-2">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Carregando fluxos...</div>
                    ) : paginatedItems.length === 0 ? (
                        <Empty 
                            title="Nenhum fluxo encontrado" 
                            description="Crie um novo fluxo para começar a automatizar suas tarefas."
                            icon={<FolderOpen className="size-6" />}
                        />
                    ) : (
                        paginatedItems.map((flow) => (
                            <Card key={flow.id} className="flex-none bg-neutral-50/30 hover:shadow-lg hover:shadow-neutral-100 transition-shadow rounded-md">
                                <CardContent>
                                    <CardDescription className="flex items-center">
                                        <div className="w-full">
                                            <div className="font-semibold text-md text-neutral-900">{flow.name}</div>
                                            <span className="text-xs text-muted-foreground">ID: {flow.id}</span>
                                        </div>
                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm">
                                                    <EllipsisVerticalIcon />
                                                </Button>} />
                                                <DropdownMenuContent align="center">
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/flow", search: { id: flow.id } })}>
                                                            Open
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => {
                                                                setFlowToDelete(flow);
                                                                setDeleteConfirmName("");
                                                            }}
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
            {!isLoading && flows.length > 0 && (
                <GenericPagination
                    totalItems={totalItems}
                    activePage={activePage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={flowToDelete !== null} onOpenChange={(open) => !open && setFlowToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="size-5" /> Excluir Fluxo
                        </DialogTitle>
                        <DialogDescription>
                            Esta ação não pode ser desfeita. Para confirmar a exclusão do fluxo <strong>{flowToDelete?.name}</strong>, digite o nome do fluxo no campo abaixo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <Input 
                            placeholder="Digite o nome do fluxo para confirmar" 
                            value={deleteConfirmName} 
                            onChange={(e) => setDeleteConfirmName(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFlowToDelete(null)}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="destructive" 
                            disabled={deleteConfirmName !== flowToDelete?.name}
                            onClick={handleDeleteFlow}
                        >
                            Confirmar Exclusão
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}