USE [master]
GO

CREATE DATABASE PQDashboard
GO

USE PQDashboard
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


INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'applicationName', N'PQDashboard', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'applicationDescription', N'Event Viewing Engine', 0, N'Administrator')
GO
INSERT [dbo].[Settings] ([Scope], [Name], [Value], [ApplicationInstance], [Roles]) VALUES (N'app.setting', N'applicationKeywords', N'open source, utility, browser, power quality, management', 0, N'Administrator')
GO

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

INSERT [dbo].[ValueListGroup] ([Name], [Description], [Enabled]) VALUES ( N'System', N'Used to set system wide settings.',1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'XDAInstance', 'http://localhost:8989', 0, 0, 0, 0, 1)
GO
INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'TimeWindow', '1', 0, 0, 0, 0, 1)
GO
INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'URL', 'http://localhost/PQDashboard', 0, 0, 0, 0, 1)
GO
INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'YearBeginDate', 'January 1', 0, 0, 0, 0, 1)
GO
INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'DefaultView.DateRange', '2', 0, 0, 0, 0, 1)
GO
INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'DefaultView.Tab', 'Events', 0, 0, 0, 0, 1)
GO
INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'DefaultView.MapGrid', 'Grid', 0, 0, 0, 0, 1)
GO
INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'System'), 0, 'DefaultView.AssetGroup', '1', 0, 0, 0, 0, 1)
GO


INSERT [dbo].[ValueListGroup] ([Name], [Description], [Enabled]) VALUES ( N'Tabs', N'Used to Enabled tab display.',1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 0, 'MeterActivity','Event Search', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 1, 'Events','Events', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 2, 'Disturbances', 'Disturbances', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 3, 'Faults', 'Faults', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 4, 'Breakers', 'Breakers', 0, 0, 0, 0, 0)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 5, 'Extensions', 'Extensions', 0, 0, 0, 0, 0)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 6, 'Trending', 'Trending', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 7, 'TrendingData', 'Trending Data', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 8, 'Completeness', 'Completeness', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueList] ([GroupID], [Key], [Text], [AltText1], [SortOrder], [Flag], [IsDefault],[Hidden], [Enabled] ) VALUES ( (SELECT ID FROM ValueListGroup WHERE Name = 'Tabs'), 9, 'Correctness', 'Correctness', 0, 0, 0, 0, 1)
GO

INSERT [dbo].[ValueListGroup] ([Name], [Description], [Enabled]) VALUES ( N'Tabs', N'Used to Enabled tab display.',1)
GO



INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Fault', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'RecloseIntoFault', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'BreakerOpen', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Sag', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Swell', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Interruption', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Transient', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Other', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Test', 0)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Breaker', 0)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChart', 'Snapshot', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Fault,#FF2800', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'RecloseIntoFault,#323232', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'BreakerOpen,#B245BA', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Sag,#FF9600', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Swell,#00FFF4', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Interruption,#C00000', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Transient,#FFFF00', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Other,#0000FF', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Test,#A9A9A9', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Breaker,#A500FF', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('EventsChartColors', 'Snapshot,#9db087', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChart', '5', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChart', '4', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChart', '3', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChart', '2', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChart', '1', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChart', '0', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChartColors', '5,#C00000', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChartColors', '4,#FF2800', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChartColors', '3,#FF9600', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChartColors', '2,#00FFF4', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChartColors', '1,#FFFF00', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('DisturbancesChartColors', '0,#0000FF', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '0', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '0.208', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '12', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '13.8', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '46', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '69', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '115', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '135', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '161', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '200', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '230', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '300', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChart', '500', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '0,#90ed7d', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '0.208,#78E35C', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '12,#806283', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '13.8,#DC14B2', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '46,#434348', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '69,#ff0000', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '115,#f7a35c', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '135,#8085e9', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '161,#f15c80', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '200,#e4d354', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '230,#2b908f', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '300,#f45b5b', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('FaultsChartColors', '500,#91e8e1', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChart', 'Normal', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChart', 'Late', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChart', 'Indeterminate', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChart', 'No Operation', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChartColors', 'Normal,#FF0000', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChartColors', 'Late,#434348', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChartColors', 'Indeterminate,#90ED7D', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('BreakersChartColors', 'No Operation,#FC8EBA', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('TrendingChart', 'Alarm', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('TrendingChart', 'Offnormal', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('TrendingChartColors', 'Alarm,#ff0000', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('TrendingChartColors', 'Offnormal,#434348', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChart', '> 100%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChart', '98% - 100%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChart', '90% - 97%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChart', '70% - 89%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChart', '50% - 69%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChart', '>0% - 49%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChart', '0%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChartColors', '> 100%,#00FFF4', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChartColors', '98% - 100%,#00C80E', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChartColors', '90% - 97%,#FFFF00', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChartColors', '70% - 89%,#FF9600', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChartColors', '50% - 69%,#FF2800', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChartColors', '>0% - 49%,#FF0EF0', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CompletenessChartColors', '0%,#0000FF', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChart', '> 100%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChart', '98% - 100%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChart', '90% - 97%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChart', '70% - 89%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChart', '50% - 69%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChart', '>0% - 49%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChart', '0%', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChartColors', '> 100%,#00FFF4', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChartColors', '98% - 100%,#00C80E', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChartColors', '90% - 97%,#FFFF00', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChartColors', '70% - 89%,#FF9600', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChartColors', '50% - 69%,#FF2800', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChartColors', '>0% - 49%,#FF0EF0', 1)
GO

INSERT INTO DashSettings (Name, Value, Enabled) VALUES ('CorrectnessChartColors', '0%,#0000FF', 1)
GO

