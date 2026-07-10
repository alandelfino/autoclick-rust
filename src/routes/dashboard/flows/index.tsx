import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight, EllipsisVerticalIcon, FunnelIcon, PlusIcon, Search } from "lucide-react";
import { Card, CardContent, CardDescription } from "../../../components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";

const mockFlows = Array.from({ length: 25 }).map((_, index) => {
    const names = [
        "Autoclicker de Envio",
        "Validador de Contatos",
        "Automação de Checkout",
        "Backup Automatizado",
        "Extrator de Leads CRM",
        "Robô de Preenchimento",
        "Coletor de Métricas",
        "Sincronizador ERP",
    ];
    const descriptions = [
        "Executa cliques repetidos em intervalos configurados.",
        "Verifica a validade dos contatos na lista importada.",
        "Simula o fluxo completo de compra para testes de carga.",
        "Cria cópias de segurança do banco de dados local diariamente.",
        "Raspa dados de contatos públicos e envia para o pipeline.",
        "Preenche formulários complexos automaticamente a partir de planilhas.",
        "Coleta estatísticas de cliques e gera relatórios em tempo real.",
        "Sincroniza os fluxos locais com o servidor central automaticamente.",
    ];

    return {
        id: index + 1,
        name: `${names[index % names.length]} #${index + 1}`,
        description: descriptions[index % descriptions.length],
    };
});

export const Route = createFileRoute('/dashboard/flows/')({
    component: Flows,
})

function Flows() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState("50");

    const items = [
        { label: "Cadastrados recentemente", value: "recentes" },
        { label: "Cadastrados mais antigos", value: "antigos" },
        { label: "Atualizados recentemente", value: "atualizadosRecentes" },
        { label: "Atualizados mais antigos", value: "atualizadosAntigos" },
    ];

    const pageSizes = [
        { label: "10/page", value: "10" },
        { label: "20/page", value: "20" },
        { label: "50/page", value: "50" },
        { label: "100/page", value: "100" },
    ];

    const totalItems = mockFlows.length;
    const itemsPerPage = Number(pageSize);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Adjust active page if currentPage is larger than totalPages
    const activePage = Math.min(currentPage, totalPages) || 1;
    const paginatedFlows = mockFlows.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

    return (
        <main className="w-full max-w-container mx-auto flex flex-1 flex-col min-h-0">

            {/* Page header */}
            <div className="flex items-center justify-between pt-6 pb-4 shrink-0 px-4">
                <div>
                    <h1 className="text-xl font-bold">My Flows</h1>
                    <p className="text-sm text-muted-foreground">Manage and create your automation flows</p>
                </div>

                <Button className="flex items-center">
                    <PlusIcon /> New Flow
                </Button>
            </div>

            {/* Page content */}
            <div className="flex flex-1 flex-col gap-2 py-1 min-h-0 px-4">

                {/* Filters */}
                <div className="flex items-center gap-1 w-full justify-end shrink-0">

                    <InputGroup className="max-w-xs rounded-sm">
                        <InputGroupInput placeholder="Pesquisar..." />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <Select defaultValue="recentes" items={items}>
                        <SelectTrigger className="w-fit rounded-sm text-xs text-muted-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-fit">
                            <SelectGroup>
                                <SelectLabel>Ordenar por:</SelectLabel>
                                {items.map((item) => (
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

                {/* Flows list - ONLY this section will scroll */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-1 py-2">
                    {paginatedFlows.map((flow) => (
                        <Card key={flow.id} className="flex-none bg-neutral-50/30 hover:shadow-lg hover:shadow-neutral-100 transition-shadow rounded-md">
                            <CardContent>
                                <CardDescription className="flex items-center">
                                    <div className="w-full">
                                        <div className="font-semibold text-md text-neutral-900">{flow.name}</div>
                                        <span className="text-xs text-muted-foreground">{flow.description}</span>
                                    </div>
                                    <div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm">
                                                <EllipsisVerticalIcon />
                                            </Button>} />
                                            <DropdownMenuContent align="center">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        <Link to={`/flow`}>
                                                            Open
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2.5 shrink-0 py-4 px-4 border-t border-neutral-100 bg-white">
                <span className="text-xs text-neutral-500 font-inter font-medium mr-2">Total {totalItems}</span>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-neutral-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-100"
                    disabled={activePage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <button
                    className="h-7 min-w-7 px-2 flex items-center justify-center rounded border border-[#ff5a36] text-[#ff5a36] font-semibold text-xs hover:bg-[#ff5a36]/5 transition-colors cursor-pointer"
                >
                    {activePage}
                </button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-neutral-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-100"
                    disabled={activePage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                <Select value={pageSize} onValueChange={(val) => { if (val) { setPageSize(val); setCurrentPage(1); } }} items={pageSizes}>
                    <SelectTrigger size="sm" className="w-fit text-xs text-neutral-600 bg-white border border-neutral-200 px-2 rounded-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-fit">
                        <SelectGroup>
                            {pageSizes.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

        </main>
    )
}