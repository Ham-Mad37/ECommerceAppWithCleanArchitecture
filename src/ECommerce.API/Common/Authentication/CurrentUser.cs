using System.Security.Claims;
using ECommerce.Application.Common.Interfaces;

namespace ECommerce.API.Common.Authentication
{
    public class CurrentUser : ICurrentUser
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUser(
            IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public string? UserId =>
        _httpContextAccessor.HttpContext?
            .User
            .FindFirstValue(ClaimTypes.NameIdentifier)
            ?? _httpContextAccessor.HttpContext?
            .User
            .FindFirstValue("sub");

         public int? CustomerId
        {
            get
            {
                var value = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue("customerId");

                return int.TryParse(value, out var customerId)
                ? customerId
                : null;
            }
        }
        public string? Email =>
        _httpContextAccessor.HttpContext?
            .User
            .FindFirstValue(ClaimTypes.Email)
        ?? _httpContextAccessor.HttpContext?
            .User
            .FindFirstValue("email");

        public bool IsAuthenticated =>
            _httpContextAccessor.HttpContext?
                .User
                .Identity?
                .IsAuthenticated == true;
    }
}