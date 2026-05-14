import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    console.log(`[DEBUG] Tentativa de login para: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`[DEBUG] Usuário não encontrado: ${email}`);
      throw new UnauthorizedException("Credenciais inválidas");
    }

    if (!user.isActive) {
      console.log(`[DEBUG] Usuário inativo: ${email}`);
      throw new UnauthorizedException("Credenciais inválidas");
    }

    console.log(`[DEBUG] Comparando senha para: ${email}`);
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log(`[DEBUG] Senha incorreta para: ${email}`);
      throw new UnauthorizedException("Credenciais inválidas");
    }

    console.log(`[DEBUG] Login bem-sucedido para: ${email}`);
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new ForbiddenException("Acesso negado");
    }
    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) {
      throw new ForbiddenException("Acesso negado");
    }
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: "Logout realizado com sucesso" };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (user.role === Role.DEMO) {
      throw new ForbiddenException("Usuários de demonstração não podem alterar a senha");
    }

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new UnauthorizedException("Senha atual incorreta");

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: "Senha alterada com sucesso" };
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>("JWT_SECRET"),
          expiresIn: this.configService.get<string>("JWT_EXPIRES_IN", "8h"),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
          expiresIn: this.configService.get<string>(
            "JWT_REFRESH_EXPIRES_IN",
            "30d",
          ),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}
