import AppBar from "@mui/material/AppBar";
import { Button, Grid, Toolbar } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { DropdownMenu } from "./dropDownMenu";
export function Header() {
  const { isAuthenticated, username } = useAuth();
  const location = useLocation();

  // Verificar si estás en la página de inicio de sesión
  const isLoginPage = location.pathname === "/";
  const isRegisterPage = location.pathname === "/registerpage";

  // Si es la página de inicio de sesión, no mostrar el Header
  if (isLoginPage || isRegisterPage) {
    return null;
  }
  console.log(isAuthenticated);
  console.log(username);
  return (
    <AppBar
      sx={{ height: "8%", justifyContent: "center", background: "#fafafa" }}
    >
      <Toolbar>
        <Grid
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Grid
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Grid mr={20}>
              <Button
                variant="text"
                color="inherit"
                component={Link}
                to="/homepage"
              >
                <Typography variant="h4" fontWeight={600} color="secondary">
                  SportLife
                </Typography>
              </Button>
            </Grid>
            <Grid item container gap={4}>
              <Button component={Link} to="/article" sx={{ color: "#fff" }}>
                <Typography variant="h6" fontWeight={600} color="secondary">
                  Article
                </Typography>
              </Button>
              <Button component={Link} to="/searchCard2" sx={{ color: "#fff" }}>
                <Typography variant="h6" fontWeight={600} color="secondary">
                  Search
                </Typography>
              </Button>
              <Button sx={{ color: "#fff" }}>
                <Typography variant="h6" fontWeight={600} color="secondary">
                  Contact
                </Typography>
              </Button>
            </Grid>
          </Grid>
          {isAuthenticated ? (
            <Grid
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Link to="/">
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ background: "secondary", margin: "10px" }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    LogIn
                  </Typography>
                </Button>
              </Link>
              {/* Enlace de Registro */}
              <Button
                component={Link}
                to="/registerpage" // Ajusta la ruta de registro según tu configuración
                variant="contained"
                color="secondary"
                sx={{ background: "secondary", margin: "10px" }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Registro
                </Typography>
              </Button>
            </Grid>
          ) : (
            <Grid
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography variant="h4" fontWeight={600} color="secondary">
                Bienvenido, {username}!
              </Typography>

              <DropdownMenu />
            </Grid>
          )}
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
