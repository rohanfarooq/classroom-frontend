import {useMemo, useState} from 'react'
import {ListView} from "@/components/refine-ui/views/list-view.tsx";
import {Breadcrumb} from "@/components/refine-ui/layout/breadcrumb.tsx";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {CreateButton} from "@/components/refine-ui/buttons/create.tsx";
import {DataTable} from "@/components/refine-ui/data-table/data-table.tsx";
import {useTable} from "@refinedev/react-table";
import {ClassDetails, Subject, User} from "@/types";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge.tsx";
import {useList} from "@refinedev/core";
import {ShowButton} from "@/components/refine-ui/buttons/show.tsx";

const ClassesList = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSubject, setSelectedSubject] = useState('all')
    const [selectedTeacher, setSelectedTeacher] = useState('all')

    const {query: subjectsQuery} = useList<Subject>({
        resource: 'subjects',
        pagination: {pageSize: 1000}
    })

    const {query: teachersQuery} = useList<User>({
        resource: 'users',
        filters: [{field: 'role', operator: 'eq', value: 'teacher'}],
        pagination: {pageSize: 1000}
    })

    const subjects = subjectsQuery?.data?.data || []
    const teachers = teachersQuery?.data?.data || []

    const subjectFilters = selectedSubject === 'all' ? [] : [{
        field: 'subject',
        operator: 'eq' as const,
        value: selectedSubject
    }]

    const teacherFilters = selectedTeacher === 'all' ? [] : [{
        field: 'teacher',
        operator: 'eq' as const,
        value: selectedTeacher
    }]

    const searchFilters = searchQuery ? [{
        field: 'name',
        operator: 'contains' as const,
        value: searchQuery
    }] : []

    const classTable = useTable<ClassDetails>({
        columns: useMemo<ColumnDef<ClassDetails>[]>(() => [
            {
                id: 'bannerUrl',
                accessorKey: 'bannerUrl',
                header: () => <p className="column-title ml-2">Banner</p>,
                cell: ({getValue}) => {
                    const url = getValue<string>()
                    return (
                        <div className="ml-2 w-12 h-12 rounded overflow-hidden">
                            {url ? (
                                <img src={url} alt="Banner" className="w-full h-full object-cover"/>
                            ) : (
                                <div
                                    className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                                    No Banner
                                </div>
                            )}
                        </div>
                    )
                }
            },
            {
                id: 'name',
                accessorKey: 'name',
                header: () => <p className="column-title">Class Name</p>,
                cell: ({getValue}) => <span className="font-medium text-foreground">{getValue<string>()}</span>,
            },
            {
                id: 'status',
                accessorKey: 'status',
                header: () => <p className="column-title">Status</p>,
                cell: ({getValue}) => {
                    const status = getValue<string>()
                    return (
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                            {status}
                        </Badge>
                    )
                }
            },
            {
                id: 'subject',
                accessorKey: 'subject.name',
                header: () => <p className="column-title">Subject</p>,
                cell: ({getValue}) => <span className="text-foreground">{getValue<string>()}</span>,
            },
            {
                id: 'teacher',
                accessorKey: 'teacher.name',
                header: () => <p className="column-title">Teacher</p>,
                cell: ({getValue}) => <span className="text-foreground">{getValue<string>()}</span>,
            },
            {
                id: 'capacity',
                accessorKey: 'capacity',
                header: () => <p className="column-title">Capacity</p>,
                cell: ({getValue}) => <span className="text-foreground">{getValue<number>()}</span>,
            },
            {
                id: 'details',
                size: 140,
                header: () => <p className="column-title">Details</p>,
                cell: ({row}) => <ShowButton resource="classes" recordItemId={row.original.id} variant="outline"
                                             size="sm">View</ShowButton>,
            },
        ], []),
        refineCoreProps: {
            resource: 'classes',
            pagination: {pageSize: 10, mode: 'server'},
            filters: {
                permanent: [...subjectFilters, ...teacherFilters, ...searchFilters]
            },
            sorters: {
                initial: [
                    {field: 'createdAt', order: 'desc'}
                ]
            },
        }
    })

    return (
        <ListView>
            <Breadcrumb/>
            <h1 className="page-title">Classes</h1>
            <div className="intro-row">
                <p>Manage and monitor your classroom sections and their details.</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon"/>
                        <Input
                            type="text"
                            placeholder="Search by class name..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by subject"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map(subject => (
                                    <SelectItem value={subject.name} key={subject.id}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by teacher"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teachers</SelectItem>
                                {teachers.map(teacher => (
                                    <SelectItem value={teacher.name} key={teacher.id}>
                                        {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <CreateButton resource="classes"/>
                    </div>
                </div>
            </div>
            <DataTable table={classTable}/>
        </ListView>
    )
}

export default ClassesList
