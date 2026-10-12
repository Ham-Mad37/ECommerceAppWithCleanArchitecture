namespace ECommerce.Domain.Entities.Payments
{
    public enum PaymentMethod
    {
        CashOnDelivery = 1,
        BankTransfer = 2
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Paid = 2,
        Cancelled = 3,
        RefundDue = 4
    }
}