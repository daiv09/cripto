import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"

const DataTable = <T,>({
    columns, data, rowKey, tableClassName, headerRowClassName, headerCellClassName, bodyRowClassName, bodyCellClassName, headerClassName
}: DataTableProps<T>) => {
    return (
        <div>
            <Table className={cn('custom-scrollbar', tableClassName)}>
                <TableHeader className={headerClassName}>
                    <TableRow className={cn('hover:bg-transparent!', headerRowClassName)}>
                        {columns.map((column, i) => (
                            <TableHead key={i} className={cn('bg-dark-400 py-4 text-purple-100 first:pl-5 last:pr-5', headerCellClassName)}>
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, rowInd) => (
                        <TableRow key={rowKey(row,rowInd)} className={cn('overflow-hidden rounded-lg border-b border-purple-100/5 hover:bg-dark-400/30! relative', bodyRowClassName)}>
                            {columns.map((col, colInd) => (
                                <TableCell key={colInd} className={cn('py-4 first:pl-5 last:pr-5')}>
                                    {col.cell(row,rowInd)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default DataTable