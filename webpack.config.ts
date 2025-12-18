import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

type Mode = "production" | "development";

interface EnvVariables {
  mode: Mode;
  port: number;
}

export default (env: EnvVariables) => {
  const isDev = env.mode === "development";
  const isProd = env.mode === "production";

  const config: webpack.Configuration = {
    mode: env.mode ?? "development",
    entry: path.resolve(__dirname, "src", "index.tsx"),
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "[name].[contenthash].js",
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "index.html"),
      }),
      isDev && new webpack.ProgressPlugin(),
      isProd &&
        new MiniCssExtractPlugin({
          filename: "css/[name].[contenthash:8].css",
          chunkFilename: "css/[name].[contenthash:8].css",
        }),
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 8192, // Файлы меньше 8 KB становятся встроенными base64
                fallback: "file-loader",
                name: "img/[name]-[hash:8].[ext]",
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "fonts/[name]-[hash:8].[ext]",
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    devtool: isDev ? "inline-source-map" : "source-map",
    devServer: isDev
      ? {
          port: env.port ?? 3000,
          open: true,
        }
      : undefined,
  };
  return config;
};
