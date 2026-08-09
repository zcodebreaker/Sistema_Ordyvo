using Microsoft.Win32;
using System;
using System.Security.Cryptography;
using System.Text;

namespace Codev_V2.Functions;

public static class RegistrarLogin
{
    private const string RootPath = @"Software\Codev_V2\Auth";
    private const string KeyUsername = "Username";
    private const string KeyPassword = "PasswordProtected";
    public static void Save(string username, string password)
    {
        using var key = Registry.CurrentUser.CreateSubKey(RootPath, writable: true);
        if (key is null) throw new InvalidOperationException("Não foi possível salvar no Registro.");

        key.SetValue(KeyUsername, username ?? "", RegistryValueKind.String);

        var protectedBytes = Protect(password ?? "");
        key.SetValue(KeyPassword, Convert.ToBase64String(protectedBytes), RegistryValueKind.String);
    }
    public static (string Username, string Password) Load()
    {
        using var key = Registry.CurrentUser.OpenSubKey(RootPath, writable: false);
        if (key is null) return ("", "");

        var username = (key.GetValue(KeyUsername) as string) ?? "";

        var b64 = (key.GetValue(KeyPassword) as string) ?? "";
        if (string.IsNullOrWhiteSpace(b64)) return (username, "");
        try
        {
            var bytes = Convert.FromBase64String(b64);
            var password = Unprotect(bytes);
            return (username, password);
        }
        catch
        {
            return (username, "");
        }
    }
    public static void Clear()
    {
        using var key = Registry.CurrentUser.OpenSubKey(RootPath, writable: true);
        if (key is null) return;

        key.DeleteValue(KeyUsername, throwOnMissingValue: false);
        key.DeleteValue(KeyPassword, throwOnMissingValue: false);
    }

    private static byte[] Protect(string plainText)
    {
        var bytes = Encoding.UTF8.GetBytes(plainText);
        return ProtectedData.Protect(bytes, optionalEntropy: null, DataProtectionScope.CurrentUser);
    }
    private static string Unprotect(byte[] protectedBytes)
    {
        var bytes = ProtectedData.Unprotect(protectedBytes, optionalEntropy: null, DataProtectionScope.CurrentUser);
        return Encoding.UTF8.GetString(bytes);
    }
}