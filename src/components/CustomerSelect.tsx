import { useId } from 'react'
import { useKhata } from '../store/KhataStore'

/** Every transaction is bound to a customerId, so the picker is the only entry point. */
export function CustomerSelect({ id }: { id?: string }) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const { customers, selectedCustomerId, selectCustomer } = useKhata()

  return (
    <div className="text-sm">
      <label
        htmlFor={selectId}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-400"
      >
        Select customer
      </label>
      <select
        id={selectId}
        className="min-h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-paper-50 transition-[border-color,box-shadow] duration-150 focus:border-teal-400"
        value={selectedCustomerId}
        onChange={(event) => selectCustomer(event.target.value)}
      >
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name} · {customer.phone}
          </option>
        ))}
      </select>
    </div>
  )
}
