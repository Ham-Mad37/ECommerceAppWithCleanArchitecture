namespace ECommerce.Application.Features.Customers.DTOs
{
    public sealed record CustomerListDto(
        int Id,
        string FirstName,
        string LastName,
        string Email,
        bool IsAvtive
    );
}