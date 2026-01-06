'use client'

import { usePathname } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'My Forms', href: '/forms' },
]

/**
 * Enhanced navigation bar with active state indicators
 * Shows current location and provides quick access to main sections
 */
export function NavBar() {
  const pathname = usePathname()
  // Check if a nav item is active
  const isActive = (href: string): boolean => {
    if (href === '/forms') {
      return pathname === '/forms' || pathname.startsWith('/forms/')
    }
    return pathname === href
  }

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo / App Name */}
          <Link href="/forms" passHref legacyBehavior>
            <Typography
              component="a"
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mr: 4,
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              Simple Form
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
