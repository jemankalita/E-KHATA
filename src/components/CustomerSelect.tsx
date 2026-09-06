import { useId } from 'react'
import { useKhata } from '../store/KhataStore'

/** Every transaction is bound to a customer account, so the picker is the only entry point. */
export function CustomerSelect({ id }: { id?: string }) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const { customers, selectedCustomerId, selectCustomer } = useKhata()

  return (
    <div className="text-sm">
      <label htmlFor={selectId} className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
        Select account
      </label>
      <select id={selectId} className="field" value={selectedCustomerId} onChange={(event) => selectCustomer(event.target.value)}>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>
    </div>
  )
}
