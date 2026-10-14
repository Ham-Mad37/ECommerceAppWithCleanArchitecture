using ECommerce.Domain.Common.Exceptions;

namespace ECommerce.Domain.Entities.Payments
{
    public sealed class Payment
    {
        private Payment() { }

        public int Id { get; private set; }
        public int OrderId { get; private set; }
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; private set; }
        public decimal Amount { get; private set; }
        public string? Reference { get; set; }
        public DateTime? PaidAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public static Payment Create(PaymentMethod method, decimal amount)
        {
            if (!Enum.IsDefined(method))
                throw new DomainException("Invalid payment method.");
            if (amount <= 0)
                throw new DomainException("Payment amount cannot be negative.");

            return new Payment
            {
                Method = method,
                Amount = amount,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

        }

        public void MarkPaid(string? refrence)
        {
            if (Status != PaymentStatus.Pending)
                throw new DomainException("Only pending payments can be marked as paid.");

            var trimmed = string.IsNullOrWhiteSpace(refrence) ? null : refrence.Trim();

            if (Method == PaymentMethod.BankTransfer && trimmed is null)
                throw new DomainException("A transfer reference is required for bank-transfer payments.");

            if (trimmed is not null && trimmed.Length > 100)
                throw new DomainException("Payment reference cannot exceed 100 characters.");

            refrence = trimmed;
            Status = PaymentStatus.Paid;
            PaidAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        // Called when the order is cancelled.
        public  void HandleOrderCancelled()
        {
            if (Status == PaymentStatus.Pending)
                Status = PaymentStatus.Cancelled;

            else if (Status == PaymentStatus.Paid)
                Status = PaymentStatus.RefundDue; // money must be returned manually

            UpdatedAt = DateTime.UtcNow;
        }
    }
}