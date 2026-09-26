using ECommerce.Infrastructure;

namespace ECommerce.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDI(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddInfrastructure(configuration);
            return services;
        }
    }
}