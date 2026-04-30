using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.User.GetUserData
{
    public record GetUserDataResponse(bool Flag, string message = null!, [property: JsonPropertyName("user")]  Object userData = null!);
}
