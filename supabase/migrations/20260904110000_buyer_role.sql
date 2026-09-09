-- Enum changes must commit before the marketplace migration can use the value.
alter type user_role add value if not exists 'corporate_buyer';
