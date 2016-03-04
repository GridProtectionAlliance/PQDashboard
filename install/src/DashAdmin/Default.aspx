<%@ page title="Home Page" language="C#" masterpagefile="~/Site.Master" autoeventwireup="true" inherits="_Default, App_Web_zhfkqfbr" %>

<asp:Content runat="server" ID="FeaturedContent" ContentPlaceHolderID="FeaturedContent">
    <section class="featured">
        <div class="content-wrapper">
            <hgroup class="title">
                <h1>PQDashboard Configuration - <%: Title %></h1>
            </hgroup>
            <asp:Menu ID="Menu1" runat="server" DataSourceID="SiteMapDataSource1" StaticSubMenuIndent="16px">
            </asp:Menu>
            <asp:SiteMapDataSource ID="SiteMapDataSource1" runat="server" />
        </div>
    </section>
</asp:Content>

<asp:Content runat="server" ID="BodyContent" ContentPlaceHolderID="MainContent">
    <h3>Instructions for Managing Users, Groups, and Settings:</h3>
    <ol class="round">
        <li class="one">
            <h5>Creating and Managing Users and Groups</h5>
            The user's NTID or Domain ID (login) must be created and managed by using the "Manage Users" selection<br />
            accessible from the "Home" menu above. Users are then given access to groups that contain meters.<br />  
            Users can only access the meters assigned to their Group.<br /><br />
            (1) Add a user's ID to the blank line under "Name", Click the "Active" checkbox then click "Insert".<br />
            (2) Once the user is inserted, they can be assigned to a group by selecting the "Edit" button next to their name.<br />
            (3) Select the group or groups and click the > button to move the group from the "Available" to the "Authorized" List.<br />
            (4) Click the "Update" button to the left of the user's name to complete the process. That user can now see the meters in their groups.<br />
            (5) Users can be deactivated by clicking "Edit" and then deselecting the "Active" checkbox.<br />
            (6) Users can be deleted by clicking the "Delete" button.<br />
        </li>
        <li class="two">
            <h5>Creating and Managing Groups of Meters</h5>
            Groups of meters are created to compartmentalize sets of meters to be accessed by the users.<br /> 
            This is done by using the "Manage Groups" selection accessible from the Home menu above.<br /><br />
            
            (1) Add a group name to the first available blank line under the "groupName" column.<br />
            (2) Click the "Active" checkbox then click "Insert".<br />
            (3) Once the group is inserted, it can then be edited to assign sets of meters by selecting the "Edit" button next to the group name.<br />
            (4) Select the meter or meters and click the > button to move the meters from the "Available" to the "Authorized" List.<br />
            (5) Click the Update button to the left of the group to complete the process. Users assigned to that group can now see the meters in that group.<br />

        </li>
        <li class="three">
            <h5>Dashboard Settings</h5>
            There are numbers of settings accessible under the "Dashboard Settings" selection <br />
            accessible from the Home menu above.<br/>
            
            Typically these should not be changed.<br/>
            
            These turn on and off various tabs and map layers in the Dashboard. <br /> <br />
            
            (1) DashTab - Tabs to be seen in the application: <br />
                &nbsp;&nbsp;Name: DashTab, Value: #tabsEvents Enabled: Checked <br />
                &nbsp;&nbsp;Name: DashTab, Value: #tabsTrending Enabled: Checked <br />
                &nbsp;&nbsp;Name: DashTab, Value: #tabsFaults Enabled: Checked <br />
                &nbsp;&nbsp;Name: DashTab, Value: #tabsBreakers Enabled: Checked <br />
                &nbsp;&nbsp;Name: DashTab, Value: #tabsCompleteness Enabled: Checked <br />
                &nbsp;&nbsp;Name: DashTab, Value: #tabsCorrectness Enabled: Checked <br />
                &nbsp;&nbsp;Name: MapLayer, Value: "URL to Tile Server" Enabled: Checked <br />

        </li>
    </ol>
</asp:Content>