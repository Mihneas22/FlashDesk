using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.UserProfile
{
    public record UpdateUserProfileResponse(bool Flag, string message = null!);
}
