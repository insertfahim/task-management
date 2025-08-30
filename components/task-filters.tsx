"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Category {
    id: string;
    name: string;
    color: string;
}

interface Filters {
    status: string;
    category: string;
    priority: string;
}

interface TaskFiltersProps {
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
    sortBy: string;
    onSortByChange: (sortBy: string) => void;
    sortOrder: "asc" | "desc";
    onSortOrderChange: (order: "asc" | "desc") => void;
    categories: Category[];
}

export default function TaskFilters({
    filters,
    onFiltersChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    categories,
}: TaskFiltersProps) {
    const handleFilterChange = (key: keyof Filters, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            status: "all",
            category: "all",
            priority: "all",
        });
    };

    const toggleSortOrder = () => {
        onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={filters.status}
                        onValueChange={(value) =>
                            handleFilterChange("status", value)
                        }
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Category Filter */}
                    <Select
                        value={filters.category}
                        onValueChange={(value) =>
                            handleFilterChange("category", value)
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor: category.color,
                                            }}
                                        />
                                        {category.name}
                                    </div>
                                </SelectItem>
                            ))}
                            <SelectItem value="none">Uncategorized</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Priority Filter */}
                    <Select
                        value={filters.priority}
                        onValueChange={(value) =>
                            handleFilterChange("priority", value)
                        }
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    High
                                </span>
                            </SelectItem>
                            <SelectItem value="medium">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Medium
                                </span>
                            </SelectItem>
                            <SelectItem value="low">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Low
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Sort by:
                        </span>
                        <Select value={sortBy} onValueChange={onSortByChange}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">
                                    Created
                                </SelectItem>
                                <SelectItem value="due_date">
                                    Due Date
                                </SelectItem>
                                <SelectItem value="priority">
                                    Priority
                                </SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleSortOrder}
                            className="px-2"
                        >
                            {sortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                            ) : (
                                <ArrowDown className="h-4 w-4" />
                            )}
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
