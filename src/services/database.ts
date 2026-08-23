import { supabase } from '../lib/supabase';
import { Operator, ToolItem, ToolWithdrawal } from '../types';

type OperatorRow = {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    sector: string;
    machine: string;
    badge: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    avatar_url?: string | null;
};

export async function loadDatabase() {
    if (!supabase) return null;

    const [operatorsResult, withdrawalsResult, toolsResult] = await Promise.all([
        supabase.from('operators').select('*').order('name'),
        supabase.from('withdrawals').select('*').order('date_retirada', { ascending: false }),
        supabase.from('tools').select('*').order('name')
    ]);

    if (operatorsResult.error) throw operatorsResult.error;
    if (withdrawalsResult.error) throw withdrawalsResult.error;
    if (toolsResult.error) throw toolsResult.error;

    return {
        operators: (operatorsResult.data || []).map(mapOperatorFromRow),
        withdrawals: (withdrawalsResult.data || []).map(mapWithdrawalFromRow),
        tools: (toolsResult.data || []).map(mapToolFromRow)
    };
}

export async function saveOperators(operators: Operator[]) {
    if (!supabase) return;
    const { error } = await supabase.from('operators').upsert(operators.map(mapOperatorToRow));
    if (error) throw error;
}

export async function saveWithdrawals(withdrawals: ToolWithdrawal[]) {
    if (!supabase) return;
    const { error } = await supabase.from('withdrawals').upsert(withdrawals.map(mapWithdrawalToRow));
    if (error) throw error;
}

export async function saveTools(tools: ToolItem[]) {
    if (!supabase) return;
    const { error } = await supabase.from('tools').upsert(tools);
    if (error) throw error;
}

function mapOperatorToRow(operator: Operator): OperatorRow {
    return {
        id: operator.id,
        first_name: operator.firstName,
        last_name: operator.lastName,
        name: operator.name,
        sector: operator.sector,
        machine: operator.machine,
        badge: operator.badge,
        email: operator.email || null,
        phone: operator.phone || null,
        notes: operator.notes || null,
        avatar_url: operator.avatarUrl || null
    };
}

function mapOperatorFromRow(row: OperatorRow): Operator {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        name: row.name,
        sector: row.sector,
        machine: row.machine,
        badge: row.badge,
        email: row.email || undefined,
        phone: row.phone || undefined,
        notes: row.notes || undefined,
        avatarUrl: row.avatar_url || undefined
    };
}

function mapToolFromRow(row: ToolItem): ToolItem {
    return row;
}

function mapWithdrawalToRow(withdrawal: ToolWithdrawal) {
    return {
        id: withdrawal.id,
        tool_id: withdrawal.toolId,
        tool_name: withdrawal.toolName,
        spec: withdrawal.spec,
        operator_id: withdrawal.operatorId,
        operator_name: withdrawal.operatorName,
        sector: withdrawal.sector,
        machine: withdrawal.machine,
        date_retirada: withdrawal.dateRetirada,
        date_devolucao: withdrawal.dateDevolucao || null,
        expected_return: withdrawal.expectedReturn || null,
        status: withdrawal.status,
        notes: withdrawal.notes || null,
        transferred_from: withdrawal.transferredFrom || null,
        transferred_at: withdrawal.transferredAt || null,
        is_overtime: withdrawal.isOvertime || false,
        overtime_until: withdrawal.overtimeUntil || null
    };
}

function mapWithdrawalFromRow(row: Record<string, unknown>): ToolWithdrawal {
    return {
        id: String(row.id),
        toolId: String(row.tool_id),
        toolName: String(row.tool_name),
        spec: String(row.spec),
        operatorId: String(row.operator_id),
        operatorName: String(row.operator_name),
        sector: String(row.sector),
        machine: String(row.machine),
        dateRetirada: String(row.date_retirada),
        dateDevolucao: row.date_devolucao ? String(row.date_devolucao) : undefined,
        expectedReturn: row.expected_return ? String(row.expected_return) : undefined,
        status: row.status as ToolWithdrawal['status'],
        notes: row.notes ? String(row.notes) : undefined,
        transferredFrom: row.transferred_from ? String(row.transferred_from) : undefined,
        transferredAt: row.transferred_at ? String(row.transferred_at) : undefined,
        isOvertime: Boolean(row.is_overtime),
        overtimeUntil: row.overtime_until ? String(row.overtime_until) : undefined
    };
}
