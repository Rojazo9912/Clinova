import { getClinicSubscription } from '@/lib/actions/subscription'
import BillingClient from './BillingClient'

interface Props {
    searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function BillingPage({ searchParams }: Props) {
    const params = await searchParams
    const subscription = await getClinicSubscription()

    return (
        <BillingClient
            subscription={subscription}
            showSuccess={params.success === 'true'}
            showCanceled={params.canceled === 'true'}
        />
    )
}
