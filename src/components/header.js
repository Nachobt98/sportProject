import AppBar from "@mui/material/AppBar";
import { Button, Grid, Toolbar } from "@mui/material";
import Typography from "@mui/material/Typography";
export function Header() {
  const navItems = ["Home", "About", "Contact"];
  return (
    <AppBar color="primary" sx={{ height: "8%", justifyContent: "center" }}>
      <Toolbar>
        <Grid
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Grid mr={20}>
            <Button variant="text" color="inherit">
              <Typography variant="h5">SportLife</Typography>
            </Button>
          </Grid>
          <Grid sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: "#fff" }}>
                <Typography variant="h6">{item}</Typography>
              </Button>
            ))}
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
