# FindEg

FindEg manages a multi-portal commerce experience for customers, staff, and school staff.

## Language

**Current Session**:
The authenticated identity and authorization context attached to one browser request. It represents the active User, portal role, and granted permissions for that request.
_Avoid_: login state, auth context

**Active Portal**:
The single portal a User is currently accessing through a Current Session. A User eligible for more than one portal chooses the Active Portal explicitly.

**Session Invalidation**:
The removal of a Current Session because its identity is no longer valid, active, or current. It is distinct from a denied permission.

**Authorization Denial**:
A valid Current Session lacks permission for a requested operation. It does not remove the Current Session or sign the User out.

**Authorization Version**:
A User-specific version of their active and granted access. It changes when access-affecting facts change, making a Current Session’s authorization context stale.
