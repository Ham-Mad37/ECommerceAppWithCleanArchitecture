using System.Text;
using ECommerce.API;
using ECommerce.API.Common.Storage;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddDI(builder.Configuration);

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var roleManager =
       scope.ServiceProvider
           .GetRequiredService<RoleManager<IdentityRole>>();

    var userManager =
        scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

    await IdentitySeeder.SeedAsync(
        roleManager,
        userManager);
    // Dev data only: never seed sample products in production.
    if (app.Environment.IsDevelopment())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await CatalogSeeder.SeedAsync(db);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();

app.UseHttpsRedirection();

app.UseCors("Frontend");
var storageOptions = app.Services.GetRequiredService<IOptions<StorageOptions>>().Value;
var uploadsRoot = Path.GetFullPath(storageOptions.UploadsPath, app.Environment.ContentRootPath);
Directory.CreateDirectory(uploadsRoot);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = "/uploads",
    // File names are unique GUIDs and never overwritten, so they can be cached for a year.
    OnPrepareResponse = ctx =>
        ctx.Context.Response.Headers.CacheControl = "public,max-age=31536000,immutable"
});

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();