
import { useState } from "react";
import { UserProfilesTableProps } from "./types";
import { UserSearchAndFilters } from "./UserSearchAndFilters";
import { UsersTable } from "./UsersTable";
import { TablePagination } from "./TablePagination";
import { UserProfileModal } from "../UserProfileModal";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const UserProfilesTable = ({ data, branches, isLoading }: UserProfilesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all"); // Default to "all" to show all branches
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sort users alphabetically by name
  const sortedUsers = [...data].sort((a, b) => 
    a.nome_completo.localeCompare(b.nome_completo, 'pt-BR', { sensitivity: 'base' })
  );

  // Filter users based on search term and selected branch
  const filteredUsers = sortedUsers.filter((user) => {
    const matchesSearch = 
      user.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === "all" || user.filial_id === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  const displayingCount = paginatedUsers.length;
  const totalCount = filteredUsers.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserSearchAndFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        branches={branches}
        setCurrentPage={setCurrentPage}
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="mb-4 md:mb-0">
          <Badge variant="outline" className="bg-olimpics-green-primary/10 text-olimpics-green-primary">
            Exibindo {displayingCount} de {totalCount} usuários
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Usuários por página:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <UsersTable 
        data={paginatedUsers}
        branches={branches}
      />

      {filteredUsers.length > itemsPerPage && (
        <TablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      <UserProfileModal
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={() => setSelectedUser(null)}
      />
    </div>
  );
};
