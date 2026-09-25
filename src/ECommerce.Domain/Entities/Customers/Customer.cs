namespace ECommerce.Domain.Entities.Customers
{
    public class Customer
    {
        public Customer()
        {
            
        }
        public Customer(string firstName,string lastName,string email)
        {
            ValidateName(firstName,nameof(firstName));
            ValidateName(lastName,nameof(lastName));
            ValidateEmail(email);
            IsActive = true;
            CreateAt = DateTime.UtcNow;
            UpdateAt = DateTime.UtcNow;
        }
        public int Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        //
        public static Customer Create(string firstName, string lastName, string email)
        {
            return new Customer(firstName, lastName, email);
        }
        public void Update(string firstName,string lastName)
        {
            ValidateName(firstName,nameof(firstName));
            ValidateName(lastName,nameof(lastName));

            FirstName = firstName.Trim();
            LastName = lastName.Trim();
            UpdateAt = DateTime.UtcNow;

        }
        private void ValidateEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("ValidateName", nameof(email));
            if (!email.Contains('@'))
                throw new ArgumentException("Invalid email address.");
        }

        private void ValidateName(string name, string parameterName)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name is required.", nameof(parameterName));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Name cannot exceed 100 characters.", nameof(parameterName));
        }

        public void Activate()
        {
            IsActive = true;
            UpdateAt = DateTime.UtcNow;
        }
        public void Desactivate()
        {
            IsActive = false;
            UpdateAt = DateTime.UtcNow;
        }

    }
}