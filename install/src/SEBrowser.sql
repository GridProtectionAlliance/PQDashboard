USE [master]
GO

CREATE DATABASE SEBrowser
GO

USE SEBrowser
GO


CREATE TABLE [dbo].[Node](
	[ID] [uniqueidentifier] NOT NULL PRIMARY KEY,
	[Name] [varchar](200) NOT NULL,
	[Description] [varchar](max) NULL,
	[Enabled] [bit] NOT NULL DEFAULT 1,
	[CreatedOn] [datetime] NOT NULL DEFAULT getdate(),
	[CreatedBy] [varchar](200) NOT NULL DEFAULT CURRENT_USER,
	[UpdatedOn] [datetime] NOT NULL DEFAULT getdate(),
	[UpdatedBy] [varchar](200) NOT NULL DEFAULT CURRENT_USER,
)
GO

INSERT INTO NODE (Name, ID, CreatedBy, UpdatedBy) VALUES ('Default', '00000000-0000-0000-0000-000000000000', 'Installer', 'Installer')
GO

CREATE TABLE [dbo].[UserAccount](
	[ID] [uniqueidentifier] NOT NULL PRIMARY KEY DEFAULT NEWID(),
	[Name] [varchar](200) NOT NULL,
	[Password] [varchar](200) NULL,
	[FirstName] [varchar](200) NULL,
	[LastName] [varchar](200) NULL,
	[DefaultNodeID] [uniqueidentifier] NOT NULL FOREIGN KEY REFERENCES Node(ID),
	[Phone] [varchar](200) NULL,
	[Email] [varchar](200) NULL,
	[LockedOut] [bit] NOT NULL,
	[UseADAuthentication] [bit] NOT NULL,
	[ChangePasswordOn] [datetime] NULL,
	[CreatedOn] [datetime] NOT NULL DEFAULT CURRENT_USER,
	[CreatedBy] [varchar](50) NOT NULL DEFAULT GETDATE(),
	[UpdatedOn] [datetime] NOT NULL DEFAULT CURRENT_USER,
	[UpdatedBy] [varchar](50) NOT NULL DEFAULT GETDATE(),
)
GO

CREATE TABLE [dbo].[SecurityGroup](
	[ID] [uniqueidentifier] NOT NULL PRIMARY KEY DEFAULT NEWID(),
	[Name] [varchar](200) NOT NULL,
	[Description] [varchar](max) NULL,
	[CreatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
	[CreatedBy] [varchar](200) NOT NULL DEFAULT CURRENT_USER,
	[UpdatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
	[UpdatedBy] [varchar](200) NOT NULL DEFAULT CURRENT_USER,
)
GO

CREATE TABLE [dbo].[SecurityGroupUserAccount](
	[SecurityGroupID] [uniqueidentifier] NOT NULL FOREIGN KEY REFERENCES SecurityGroup(ID),
	[UserAccountID] [uniqueidentifier] NOT NULL FOREIGN KEY REFERENCES UserAccount(ID)
)
GO


CREATE TABLE [dbo].[ApplicationRole](
	[ID] [uniqueidentifier] NOT NULL PRIMARY KEY DEFAULT NEWID(),
	[Name] [varchar](200) NOT NULL,
	[Description] [varchar](max) NULL,
	[NodeID] [uniqueidentifier]  NOT NULL FOREIGN KEY REFERENCES Node(ID) DEFAULT '00000000-0000-0000-0000-000000000000',
	[CreatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
	[CreatedBy] [varchar](200) NOT NULL DEFAULT CURRENT_USER,
	[UpdatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
	[UpdatedBy] [varchar](200) NOT NULL DEFAULT CURRENT_USER,
)
GO


CREATE TABLE [dbo].[ApplicationRoleSecurityGroup](
	[ApplicationRoleID] [uniqueidentifier] NOT NULL FOREIGN KEY REFERENCES ApplicationRole(ID),
	[SecurityGroupID] [uniqueidentifier] NOT NULL FOREIGN KEY REFERENCES SecurityGroup(ID)
)
GO

CREATE TABLE [dbo].[ApplicationRoleUserAccount](
	[ApplicationRoleID] [uniqueidentifier] NOT NULL FOREIGN KEY REFERENCES ApplicationRole(ID),
	[UserAccountID] [uniqueidentifier] NOT NULL FOREIGN KEY REFERENCES UserAccount(ID)
)

GO

INSERT INTO ApplicationRole(Name, Description) VALUES('Administrator', 'Admin Role')
GO

INSERT INTO SecurityGroup(Name, Description) VALUES('BUILTIN\Users', 'All Windows authenticated users')
GO

INSERT INTO ApplicationRoleSecurityGroup(ApplicationRoleID, SecurityGroupID) VALUES((SELECT ID FROM ApplicationRole), (SELECT ID FROM SecurityGroup))
GO

INSERT INTO ApplicationRole(Name, Description) VALUES('Engineer', 'Engineer Role')
GO

INSERT INTO ApplicationRole(Name, Description) VALUES('Viewer', 'Viewer Role')
GO


CREATE TABLE [dbo].[AccessLog](
	[ID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[UserName] [varchar](200) NOT NULL,
	[AccessGranted] [bit] NOT NULL,
	[CreatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
)
GO

CREATE TABLE [dbo].[ErrorLog](
	[ID] [int] IDENTITY(1,1) NOT NULL PRIMARY  KEY,
	[Source] [varchar](200) NOT NULL,
	[Type] [varchar](max) NULL,
	[Message] [varchar](max) NOT NULL,
	[Detail] [varchar](max) NULL,
	[CreatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
)
GO

CREATE TABLE [dbo].[Settings](
	[ID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Scope] [varchar](64) NULL,
	[Name] [varchar](64) NULL,
	[Value] [varchar](512) NULL,
	[ApplicationInstance] [bit] NOT NULL,
	[Roles] [varchar](200) NULL,
)
GO

INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'applicationName', N'SEBrowser', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'applicationDescription', N'System Event Browser', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'applicationKeywords', N'open source, utility, browser, power quality, management', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'bootstrapTheme', N'~/Content/bootstrap-theme.css', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'XDAInstance', N'http://localhost:8989', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'SCInstance', N'http://localhost:8987', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'OpenSEEInstance', N'http://localhost/OpenSEE', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'eventPreviewPane.widgetSetting', N'OpenSEEInstance', N'http://localhost/OpenSEE', 0, N'Administrator')
GO

CREATE TABLE EventPreviewPaneSetting(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	Name varchar(200) NOT NULL,
	Show bit NOT NULL DEFAULT (1),
	OrderBy int NOT NULL
)

INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchOpenSEE', 1,1)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchFaultSegments', 1,2)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchAssetVoltageDisturbances', 1,3)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchCorrelatedSags', 1,4)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('TVAESRIMap', 0,5)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchFileInfo', 0,6)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchHistory', 1,7)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchRelayPerformance', 0,8)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchBreakerPerformance', 0,9)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('EventSearchNoteWindow', 1,10)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('TVALightning', 0,11)
GO
INSERT EventPreviewPaneSetting (Name, Show, OrderBy) VALUES ('TVAFaultInfo', 1,12)
GO

CREATE TABLE Links(
	ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	Name varchar(100) NOT NULL UNIQUE,
	Display varchar(100) NOT NULL,
	Value varchar(max) NOT NULL
)



CREATE TABLE [dbo].[ValueListGroup](
	[ID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Name] [varchar](200) NULL,
	[Description] [varchar](max) NULL,
	[Enabled] [bit] NOT NULL,
	[CreatedOn] [datetime] NULL DEFAULT GETDATE(),
)
GO


CREATE TABLE [dbo].[ValueList](
	[ID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[GroupID] [int] NOT NULL FOREIGN KEY REFERENCES ValueListGroup(ID),
	[Key] [int] NOT NULL,
	[Text] [varchar](200) NULL,
	[AltText1] [varchar](200) NULL,
	[AltText2] [varchar](200) NULL,
	[Abbreviation] [varchar](12) NULL,
	[Value] [int] NULL,
	[Flag] [bit] NOT NULL,
	[Description] [varchar](max) NULL,
	[SortOrder] [int] NULL,
	[IsDefault] [bit] NOT NULL,
	[Hidden] [bit] NOT NULL,
	[Enabled] [bit] NOT NULL,
	[CreatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
)
GO


-- Author: Kevin Conner
-- Source: http://stackoverflow.com/questions/116968/in-sql-server-2005-can-i-do-a-cascade-delete-without-setting-the-property-on-my
CREATE procedure [dbo].[usp_delete_cascade] (
    @base_table_name varchar(200), @base_criteria nvarchar(1000)
)
as begin
    -- Adapted from http://www.sqlteam.com/article/performing-a-cascade-delete-in-sql-server-7
    -- Expects the name of a table, and a conditional for selecting rows
    -- within that table that you want deleted.
    -- Produces SQL that, when run, deletes all table rows referencing the ones
    -- you initially selected, cascading into any number of tables,
    -- without the need for "ON DELETE CASCADE".
    -- Does not appear to work with self-referencing tables, but it will
    -- delete everything beneath them.
    -- To make it easy on the server, put a "GO" statement between each line.

    declare @to_delete table (
        id int identity(1, 1) primary key not null,
        criteria nvarchar(1000) not null,
        table_name varchar(200) not null,
        processed bit not null,
        delete_sql varchar(1000)
    )

    insert into @to_delete (criteria, table_name, processed) values (@base_criteria, @base_table_name, 0)

    declare @id int, @criteria nvarchar(1000), @table_name varchar(200)
    while exists(select 1 from @to_delete where processed = 0) begin
        select top 1 @id = id, @criteria = criteria, @table_name = table_name from @to_delete where processed = 0 order by id desc

        insert into @to_delete (criteria, table_name, processed)
            select referencing_column.name + ' in (select [' + referenced_column.name + '] from [' + @table_name +'] where ' + @criteria + ')',
                referencing_table.name,
                0
            from  sys.foreign_key_columns fk
                inner join sys.columns referencing_column on fk.parent_object_id = referencing_column.object_id
                    and fk.parent_column_id = referencing_column.column_id
                inner join  sys.columns referenced_column on fk.referenced_object_id = referenced_column.object_id
                    and fk.referenced_column_id = referenced_column.column_id
                inner join  sys.objects referencing_table on fk.parent_object_id = referencing_table.object_id
                inner join  sys.objects referenced_table on fk.referenced_object_id = referenced_table.object_id
                inner join  sys.objects constraint_object on fk.constraint_object_id = constraint_object.object_id
            where referenced_table.name = @table_name
                and referencing_table.name != referenced_table.name

        update @to_delete set
            processed = 1
        where id = @id
    end

    select 'print ''deleting from ' + table_name + '...''; delete from [' + table_name + '] where ' + criteria from @to_delete order by id desc
end
GO

-- =============================================
-- Author:      <Author, William Ernest/ Stephen Wills>
-- Create date: <Create Date,12/1/2016>
-- Description: <Description, Calls usp_delete_cascade to perform cascading deletes for a table>
-- =============================================
CREATE PROCEDURE [dbo].[UniversalCascadeDelete]
    -- Add the parameters for the stored procedure here
    @tableName VARCHAR(200),
    @baseCriteria NVARCHAR(1000)
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;
    DECLARE @deleteSQL NVARCHAR(900)

    CREATE TABLE #DeleteCascade
    (
        DeleteSQL NVARCHAR(900)
    )

    INSERT INTO #DeleteCascade
    EXEC usp_delete_cascade @tableName, @baseCriteria

    DECLARE DeleteCursor CURSOR FOR
    SELECT *
    FROM #DeleteCascade

    OPEN DeleteCursor

    FETCH NEXT FROM DeleteCursor
    INTO @deleteSQL

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_executesql @deleteSQL

        FETCH NEXT FROM DeleteCursor
        INTO @deleteSQL
    END

    CLOSE DeleteCursor
    DEALLOCATE DeleteCursor

    DROP TABLE #DeleteCascade
END
