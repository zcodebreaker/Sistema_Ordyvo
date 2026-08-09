using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordyvo_API.Migrations
{
    /// <inheritdoc />
    public partial class AtualizarCamposUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Username",
                table: "Users",
                newName: "Usuario");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Users",
                newName: "Senha");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Users",
                newName: "AppStatus");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Users",
                newName: "Data");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Usuario",
                table: "Users",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "Senha",
                table: "Users",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "Data",
                table: "Users",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "AppStatus",
                table: "Users",
                newName: "IsActive");
        }
    }
}
